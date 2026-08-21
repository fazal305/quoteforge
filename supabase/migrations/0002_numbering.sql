-- Per-organization sequential numbering for quotes and invoices.
-- A naive "count existing rows + 1" approach races under concurrent saves
-- and breaks once rows are deleted; a dedicated counter row + row lock
-- (FOR UPDATE) makes increment-and-read atomic per organization.

create table org_counters (
  organization_id uuid primary key references organizations (id) on delete cascade,
  quote_seq integer not null default 0,
  invoice_seq integer not null default 0
);

alter table org_counters enable row level security;

create policy org_counters_all on org_counters for all
  using (organization_id = current_org_id())
  with check (organization_id = current_org_id());

create or replace function next_quote_number(org_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  next_seq integer;
begin
  insert into org_counters (organization_id, quote_seq)
  values (org_id, 0)
  on conflict (organization_id) do nothing;

  update org_counters
  set quote_seq = quote_seq + 1
  where organization_id = org_id
  returning quote_seq into next_seq;

  return 'Q-' || to_char(next_seq, 'FM1000');
end;
$$;

create or replace function next_invoice_number(org_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  next_seq integer;
begin
  insert into org_counters (organization_id, invoice_seq)
  values (org_id, 0)
  on conflict (organization_id) do nothing;

  update org_counters
  set invoice_seq = invoice_seq + 1
  where organization_id = org_id
  returning invoice_seq into next_seq;

  return 'INV-' || to_char(next_seq, 'FM1000');
end;
$$;

-- SECURITY DEFINER functions bypass RLS internally, so callers are
-- restricted to their own org by requiring org_id = current_org_id().
create or replace function next_quote_number_for_current_org()
returns text
language plpgsql
security invoker
as $$
begin
  if current_org_id() is null then
    raise exception 'No organization for current user';
  end if;
  return next_quote_number(current_org_id());
end;
$$;

create or replace function next_invoice_number_for_current_org()
returns text
language plpgsql
security invoker
as $$
begin
  if current_org_id() is null then
    raise exception 'No organization for current user';
  end if;
  return next_invoice_number(current_org_id());
end;
$$;

grant execute on function next_quote_number_for_current_org() to authenticated;
grant execute on function next_invoice_number_for_current_org() to authenticated;
