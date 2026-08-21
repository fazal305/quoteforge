-- QuoteForge — initial schema
-- Multi-tenant model: every tenant-owned table carries organization_id and
-- is protected by Row Level Security (RLS). The Supabase anon/authenticated
-- key is public by design; RLS is what actually enforces tenant isolation.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------

create type user_role as enum ('BUSINESS_OWNER', 'STAFF');

create type catalog_item_type as enum ('PRODUCT', 'SERVICE');

create type quote_status as enum (
  'DRAFT', 'SENT', 'VIEWED', 'APPROVED', 'REJECTED',
  'CHANGE_REQUESTED', 'EXPIRED', 'CONVERTED'
);

create type invoice_status as enum (
  'DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED'
);

create type quote_event_type as enum (
  'CREATED', 'DRAFT_SAVED', 'SENT', 'VIEWED', 'APPROVED', 'REJECTED',
  'CHANGE_REQUESTED', 'EDITED', 'RESENT', 'EXPIRED', 'CONVERTED'
);

create type actor_type as enum ('USER', 'CUSTOMER', 'SYSTEM');

-- ---------------------------------------------------------------------
-- Core tenant + identity
-- ---------------------------------------------------------------------

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  address text,
  phone text,
  email text,
  website text,
  primary_color text not null default '#3b6df0',
  secondary_color text not null default '#14171b',
  currency text not null default 'PKR',
  footer_text text,
  default_terms text,
  payment_instructions text,
  created_at timestamptz not null default now()
);

-- One row per Supabase auth user, linking them to an organization + role.
create table users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users (id) on delete cascade,
  organization_id uuid not null references organizations (id) on delete cascade,
  role user_role not null default 'STAFF',
  name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create index idx_users_org on users (organization_id);

-- Helper: resolve the calling user's organization_id for RLS policies.
create or replace function current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from users where auth_user_id = auth.uid()
$$;

-- ---------------------------------------------------------------------
-- Customers
-- ---------------------------------------------------------------------

create table customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  name text not null,
  company text,
  email text,
  phone text,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_customers_org on customers (organization_id);

-- ---------------------------------------------------------------------
-- Catalog (products & services)
-- ---------------------------------------------------------------------

create table catalog_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  type catalog_item_type not null,
  name text not null,
  sku text,
  description text,
  unit text not null default 'unit',
  default_price numeric(14, 2) not null default 0,
  tax_rate numeric(5, 2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_catalog_org on catalog_items (organization_id);

-- ---------------------------------------------------------------------
-- Quotes
-- ---------------------------------------------------------------------

create table quotes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  customer_id uuid not null references customers (id) on delete restrict,
  quote_number text not null,
  status quote_status not null default 'DRAFT',
  currency text not null default 'PKR',
  subtotal numeric(14, 2) not null default 0,
  discount_total numeric(14, 2) not null default 0,
  tax_total numeric(14, 2) not null default 0,
  total numeric(14, 2) not null default 0,
  valid_until date,
  notes text,
  terms text,
  created_by uuid references users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, quote_number)
);

create index idx_quotes_org on quotes (organization_id);
create index idx_quotes_customer on quotes (customer_id);
create index idx_quotes_status on quotes (organization_id, status);

create table quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes (id) on delete cascade,
  catalog_item_id uuid references catalog_items (id) on delete set null,
  name text not null,
  description text,
  quantity numeric(12, 2) not null default 1,
  unit text not null default 'unit',
  unit_price numeric(14, 2) not null default 0,
  discount_percent numeric(5, 2) not null default 0,
  tax_percent numeric(5, 2) not null default 0,
  line_total numeric(14, 2) not null default 0,
  sort_order integer not null default 0
);

create index idx_quote_items_quote on quote_items (quote_id);

-- Human-readable activity/audit trail. Every lifecycle transition writes
-- one row here; UI activity feeds read only from this table.
create table quote_events (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes (id) on delete cascade,
  type quote_event_type not null,
  actor_type actor_type not null,
  actor_label text not null,
  message text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index idx_quote_events_quote on quote_events (quote_id, created_at);

-- Secure public access tokens, decoupled from the quote's primary key so
-- links can be rotated/expired without changing the quote's identity.
create table quote_public_tokens (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes (id) on delete cascade,
  token text not null unique,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_quote_tokens_quote on quote_public_tokens (quote_id);

-- ---------------------------------------------------------------------
-- Invoices
-- ---------------------------------------------------------------------

create table invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  quote_id uuid references quotes (id) on delete set null,
  customer_id uuid not null references customers (id) on delete restrict,
  invoice_number text not null,
  status invoice_status not null default 'DRAFT',
  currency text not null default 'PKR',
  subtotal numeric(14, 2) not null default 0,
  discount_total numeric(14, 2) not null default 0,
  tax_total numeric(14, 2) not null default 0,
  total numeric(14, 2) not null default 0,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, invoice_number)
);

create index idx_invoices_org on invoices (organization_id);
create index idx_invoices_quote on invoices (quote_id);

create table invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices (id) on delete cascade,
  name text not null,
  description text,
  quantity numeric(12, 2) not null default 1,
  unit text not null default 'unit',
  unit_price numeric(14, 2) not null default 0,
  discount_percent numeric(5, 2) not null default 0,
  tax_percent numeric(5, 2) not null default 0,
  line_total numeric(14, 2) not null default 0,
  sort_order integer not null default 0
);

create index idx_invoice_items_invoice on invoice_items (invoice_id);

create table payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices (id) on delete cascade,
  amount numeric(14, 2) not null,
  paid_at date not null default current_date,
  method text,
  reference text,
  notes text,
  created_at timestamptz not null default now()
);

create index idx_payments_invoice on payments (invoice_id);

-- ---------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_customers_updated_at before update on customers
  for each row execute function set_updated_at();
create trigger trg_quotes_updated_at before update on quotes
  for each row execute function set_updated_at();
create trigger trg_invoices_updated_at before update on invoices
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------

alter table organizations enable row level security;
alter table users enable row level security;
alter table customers enable row level security;
alter table catalog_items enable row level security;
alter table quotes enable row level security;
alter table quote_items enable row level security;
alter table quote_events enable row level security;
alter table quote_public_tokens enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;
alter table payments enable row level security;

-- organizations: members can read/update their own org only.
create policy org_select on organizations for select
  using (id = current_org_id());
create policy org_update on organizations for update
  using (id = current_org_id());

-- users: members can see other users in their own org.
create policy users_select on users for select
  using (organization_id = current_org_id());

-- Generic tenant-isolation policy pattern applied to every business table.
create policy customers_all on customers for all
  using (organization_id = current_org_id())
  with check (organization_id = current_org_id());

create policy catalog_all on catalog_items for all
  using (organization_id = current_org_id())
  with check (organization_id = current_org_id());

create policy quotes_all on quotes for all
  using (organization_id = current_org_id())
  with check (organization_id = current_org_id());

create policy quote_items_all on quote_items for all
  using (quote_id in (select id from quotes where organization_id = current_org_id()))
  with check (quote_id in (select id from quotes where organization_id = current_org_id()));

create policy quote_events_all on quote_events for all
  using (quote_id in (select id from quotes where organization_id = current_org_id()))
  with check (quote_id in (select id from quotes where organization_id = current_org_id()));

create policy quote_tokens_all on quote_public_tokens for all
  using (quote_id in (select id from quotes where organization_id = current_org_id()))
  with check (quote_id in (select id from quotes where organization_id = current_org_id()));

create policy invoices_all on invoices for all
  using (organization_id = current_org_id())
  with check (organization_id = current_org_id());

create policy invoice_items_all on invoice_items for all
  using (invoice_id in (select id from invoices where organization_id = current_org_id()))
  with check (invoice_id in (select id from invoices where organization_id = current_org_id()));

create policy payments_all on payments for all
  using (invoice_id in (select id from invoices where organization_id = current_org_id()))
  with check (invoice_id in (select id from invoices where organization_id = current_org_id()));

-- NOTE: the public quote page (/quote/:token) is NOT read through the
-- authenticated Supabase client — it goes through a Netlify Function using
-- the service role key, which validates the token server-side and returns
-- only the fields the customer is allowed to see. No RLS policy grants the
-- anon role direct read access to quotes/customers, by design.
