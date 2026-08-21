-- Atomic quote + line-item save. Line items are replaced wholesale on every
-- save (delete-then-reinsert) rather than diffed, which is only safe inside
-- a single transaction — hence this as a plpgsql function rather than
-- separate client-side calls.
--
-- SECURITY INVOKER: runs as the calling (authenticated) user, so the
-- existing RLS policies on quotes/quote_items still apply — this function
-- does not bypass tenant isolation, it only makes a multi-step write atomic.

create or replace function save_quote(
  p_quote_id uuid,
  p_organization_id uuid,
  p_customer_id uuid,
  p_status quote_status,
  p_currency text,
  p_subtotal numeric,
  p_discount_total numeric,
  p_tax_total numeric,
  p_total numeric,
  p_valid_until date,
  p_notes text,
  p_terms text,
  p_items jsonb
)
returns quotes
language plpgsql
security invoker
as $$
declare
  v_quote quotes;
  v_number text;
  v_created_by uuid;
begin
  select id into v_created_by from users where auth_user_id = auth.uid();

  if p_quote_id is null then
    v_number := next_quote_number(p_organization_id);

    insert into quotes (
      organization_id, customer_id, quote_number, status, currency,
      subtotal, discount_total, tax_total, total, valid_until, notes, terms, created_by
    )
    values (
      p_organization_id, p_customer_id, v_number, p_status, p_currency,
      p_subtotal, p_discount_total, p_tax_total, p_total, p_valid_until, p_notes, p_terms, v_created_by
    )
    returning * into v_quote;

    insert into quote_events (quote_id, type, actor_type, actor_label, message)
    values (v_quote.id, 'CREATED', 'USER', coalesce((select name from users where id = v_created_by), 'User'), 'Quote created');
  else
    update quotes set
      customer_id = p_customer_id,
      status = p_status,
      currency = p_currency,
      subtotal = p_subtotal,
      discount_total = p_discount_total,
      tax_total = p_tax_total,
      total = p_total,
      valid_until = p_valid_until,
      notes = p_notes,
      terms = p_terms
    where id = p_quote_id and organization_id = p_organization_id
    returning * into v_quote;

    if v_quote.id is null then
      raise exception 'Quote not found or not accessible';
    end if;
  end if;

  delete from quote_items where quote_id = v_quote.id;

  insert into quote_items (
    quote_id, catalog_item_id, name, description, quantity, unit,
    unit_price, discount_percent, tax_percent, line_total, sort_order
  )
  select
    v_quote.id,
    nullif(item->>'catalog_item_id', '')::uuid,
    item->>'name',
    item->>'description',
    (item->>'quantity')::numeric,
    item->>'unit',
    (item->>'unit_price')::numeric,
    (item->>'discount_percent')::numeric,
    (item->>'tax_percent')::numeric,
    (item->>'line_total')::numeric,
    (item->>'sort_order')::integer
  from jsonb_array_elements(p_items) as item;

  return v_quote;
end;
$$;

grant execute on function save_quote(
  uuid, uuid, uuid, quote_status, text, numeric, numeric, numeric, numeric, date, text, text, jsonb
) to authenticated;

grant execute on function next_quote_number(uuid) to authenticated;

-- Records a status transition + activity event atomically, and validates
-- the transition server-side so the UI's transition map isn't the only
-- enforcement (defense in depth — never trust the client alone).
create or replace function transition_quote_status(
  p_quote_id uuid,
  p_new_status quote_status,
  p_actor_type actor_type,
  p_actor_label text,
  p_message text,
  p_event_type quote_event_type
)
returns quotes
language plpgsql
security invoker
as $$
declare
  v_quote quotes;
  v_valid boolean;
begin
  select * into v_quote from quotes where id = p_quote_id;
  if v_quote.id is null then
    raise exception 'Quote not found or not accessible';
  end if;

  v_valid := case v_quote.status
    when 'DRAFT' then p_new_status in ('SENT')
    when 'SENT' then p_new_status in ('VIEWED', 'APPROVED', 'REJECTED', 'CHANGE_REQUESTED', 'EXPIRED')
    when 'VIEWED' then p_new_status in ('APPROVED', 'REJECTED', 'CHANGE_REQUESTED', 'EXPIRED')
    when 'CHANGE_REQUESTED' then p_new_status in ('SENT')
    when 'APPROVED' then p_new_status in ('CONVERTED')
    else false
  end;

  if not v_valid then
    raise exception 'Invalid status transition: % -> %', v_quote.status, p_new_status;
  end if;

  update quotes set status = p_new_status where id = p_quote_id
  returning * into v_quote;

  insert into quote_events (quote_id, type, actor_type, actor_label, message)
  values (p_quote_id, p_event_type, p_actor_type, p_actor_label, p_message);

  return v_quote;
end;
$$;

grant execute on function transition_quote_status(
  uuid, quote_status, actor_type, text, text, quote_event_type
) to authenticated;
