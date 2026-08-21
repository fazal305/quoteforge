// Hand-maintained types mirroring supabase/migrations/*.sql.
// Keep in sync when the schema changes — no codegen pipeline yet.

export interface OrganizationRow {
  id: string
  name: string
  logo_url: string | null
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
  primary_color: string
  secondary_color: string
  currency: string
  footer_text: string | null
  default_terms: string | null
  payment_instructions: string | null
  created_at: string
}

export interface UserRow {
  id: string
  auth_user_id: string
  organization_id: string
  role: 'BUSINESS_OWNER' | 'STAFF'
  name: string
  email: string
  created_at: string
}

export interface CustomerRow {
  id: string
  organization_id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  address: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CatalogItemRow {
  id: string
  organization_id: string
  type: 'PRODUCT' | 'SERVICE'
  name: string
  sku: string | null
  description: string | null
  unit: string
  default_price: number
  tax_rate: number
  active: boolean
  created_at: string
}

export type QuoteStatusDb =
  | 'DRAFT'
  | 'SENT'
  | 'VIEWED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CHANGE_REQUESTED'
  | 'EXPIRED'
  | 'CONVERTED'

export interface QuoteRow {
  id: string
  organization_id: string
  customer_id: string
  quote_number: string
  status: QuoteStatusDb
  currency: string
  subtotal: number
  discount_total: number
  tax_total: number
  total: number
  valid_until: string | null
  notes: string | null
  terms: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface QuoteItemRow {
  id: string
  quote_id: string
  catalog_item_id: string | null
  name: string
  description: string | null
  quantity: number
  unit: string
  unit_price: number
  discount_percent: number
  tax_percent: number
  line_total: number
  sort_order: number
}

export interface QuoteEventRow {
  id: string
  quote_id: string
  type: string
  actor_type: 'USER' | 'CUSTOMER' | 'SYSTEM'
  actor_label: string
  message: string
  metadata: Record<string, unknown>
  created_at: string
}

// Convenience joined shape used by the UI.
export interface QuoteWithCustomer extends QuoteRow {
  customer: Pick<CustomerRow, 'id' | 'name' | 'company'> | null
}

export interface QuoteWithItems extends QuoteRow {
  items: QuoteItemRow[]
}
