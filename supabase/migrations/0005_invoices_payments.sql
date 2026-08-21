-- Quote -> invoice conversion and payment recording. Both are atomic
-- (single transaction via plpgsql) for the same reason save_quote is:
-- multiple dependent writes must not partially succeed.

grant execute on function next_invoice_number_for_current_org() to authenticated;

-- Converts an APPROVED quote into an ISSUED invoice, copying line items as
-- a snapshot (invoice_items are independent rows from that point on — later
-- catalog price changes never retroactively affect an issued invoice).
-- Marks the source quote CONVERTED via the existing status-transition path
-- so the quote's own activity trail records it.
create or replace function convert_quote_to_invoice(
  p_quote_id uuid,
  p_due_date date
)
returns invoices
language plpgsql
security invoker
as $$
declare
  v_quote quotes;
  v_invoice invoices;
  v_number text;
begin
  select * into v_quote from quotes where id = p_quote_id;
  if v_quote.id is null then
    raise exception 'Quote not found or not accessible';
  end if;
  if v_quote.status <> 'APPROVED' then
    raise exception 'Only approved quotes can be converted to an invoice (current status: %)', v_quote.status;
  end if;

  v_number := next_invoice_number(v_quote.organization_id);

  insert into invoices (
    organization_id, quote_id, customer_id, invoice_number, status,
    currency, subtotal, discount_total, tax_total, total, due_date
  )
  values (
    v_quote.organization_id, v_quote.id, v_quote.customer_id, v_number, 'ISSUED',
    v_quote.currency, v_quote.subtotal, v_quote.discount_total, v_quote.tax_total, v_quote.total, p_due_date
  )
  returning * into v_invoice;

  insert into invoice_items (
    invoice_id, name, description, quantity, unit, unit_price,
    discount_percent, tax_percent, line_total, sort_order
  )
  select v_invoice.id, name, description, quantity, unit, unit_price,
    discount_percent, tax_percent, line_total, sort_order
  from quote_items
  where quote_id = v_quote.id;

  update quotes set status = 'CONVERTED' where id = v_quote.id;

  insert into quote_events (quote_id, type, actor_type, actor_label, message)
  values (
    v_quote.id, 'CONVERTED', 'USER',
    coalesce((select name from users where auth_user_id = auth.uid()), 'User'),
    format('Converted to invoice %s.', v_number)
  );

  return v_invoice;
end;
$$;

grant execute on function convert_quote_to_invoice(uuid, date) to authenticated;

-- Records a payment and recomputes the invoice's status from the total
-- paid so far, rather than trusting a client-supplied status. This is the
-- only place invoice status changes after issuance, so it can't drift out
-- of sync with the payments table.
create or replace function record_payment(
  p_invoice_id uuid,
  p_amount numeric,
  p_paid_at date,
  p_method text,
  p_reference text,
  p_notes text
)
returns invoices
language plpgsql
security invoker
as $$
declare
  v_invoice invoices;
  v_total_paid numeric;
begin
  select * into v_invoice from invoices where id = p_invoice_id;
  if v_invoice.id is null then
    raise exception 'Invoice not found or not accessible';
  end if;
  if v_invoice.status in ('CANCELLED', 'PAID') then
    raise exception 'Cannot record a payment on a % invoice', v_invoice.status;
  end if;
  if p_amount <= 0 then
    raise exception 'Payment amount must be greater than zero';
  end if;

  insert into payments (invoice_id, amount, paid_at, method, reference, notes)
  values (p_invoice_id, p_amount, p_paid_at, p_method, p_reference, p_notes);

  select coalesce(sum(amount), 0) into v_total_paid from payments where invoice_id = p_invoice_id;

  update invoices
  set status = case
    when v_total_paid >= total then 'PAID'
    when v_total_paid > 0 then 'PARTIALLY_PAID'
    else status
  end
  where id = p_invoice_id
  returning * into v_invoice;

  return v_invoice;
end;
$$;

grant execute on function record_payment(uuid, numeric, date, text, text, text) to authenticated;
