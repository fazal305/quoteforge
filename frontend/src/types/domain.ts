// Shared domain types. Kept in sync with supabase/migrations enums —
// if you add a status there, add it here too.

export type UserRole = 'BUSINESS_OWNER' | 'STAFF'

export type QuoteStatus =
  | 'DRAFT'
  | 'SENT'
  | 'VIEWED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CHANGE_REQUESTED'
  | 'EXPIRED'
  | 'CONVERTED'

export type InvoiceStatus =
  | 'DRAFT'
  | 'ISSUED'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED'

export type CatalogItemType = 'PRODUCT' | 'SERVICE'

// Valid quote status transitions. The backend is the source of truth for
// enforcement (see netlify/functions + RLS/triggers); this map exists so
// the UI can disable actions that would be rejected anyway.
export const QUOTE_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  DRAFT: ['SENT'],
  SENT: ['VIEWED', 'APPROVED', 'REJECTED', 'CHANGE_REQUESTED', 'EXPIRED'],
  VIEWED: ['APPROVED', 'REJECTED', 'CHANGE_REQUESTED', 'EXPIRED'],
  CHANGE_REQUESTED: ['SENT'],
  APPROVED: ['CONVERTED'],
  REJECTED: [],
  EXPIRED: [],
  CONVERTED: [],
}

export interface Organization {
  id: string
  name: string
  logoUrl: string | null
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
  primaryColor: string
  secondaryColor: string
  currency: string
  footerText: string | null
  defaultTerms: string | null
  paymentInstructions: string | null
}
