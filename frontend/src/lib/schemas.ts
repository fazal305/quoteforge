import { z } from 'zod'

export const customerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  company: z.string().max(200).optional().or(z.literal('')),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  phone: z.string().max(50).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
})
export type CustomerFormValues = z.infer<typeof customerSchema>

export const catalogItemSchema = z.object({
  type: z.enum(['PRODUCT', 'SERVICE']),
  name: z.string().min(1, 'Name is required').max(200),
  sku: z.string().max(100).optional().or(z.literal('')),
  description: z.string().max(1000).optional().or(z.literal('')),
  unit: z.string().min(1, 'Unit is required').max(50),
  default_price: z.number().min(0, 'Must be 0 or more'),
  tax_rate: z.number().min(0).max(100),
  active: z.boolean(),
})
export type CatalogItemFormValues = z.infer<typeof catalogItemSchema>

export const quoteLineItemSchema = z.object({
  catalog_item_id: z.string().nullable(),
  name: z.string().min(1, 'Item name is required'),
  description: z.string().nullable(),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unit: z.string().min(1),
  unit_price: z.number().min(0, 'Price cannot be negative'),
  discount_percent: z.number().min(0).max(100),
  tax_percent: z.number().min(0).max(100),
})
export type QuoteLineItemFormValues = z.infer<typeof quoteLineItemSchema>

export const organizationSchema = z.object({
  name: z.string().min(1, 'Business name is required').max(200),
  address: z.string().max(500).optional().or(z.literal('')),
  phone: z.string().max(50).optional().or(z.literal('')),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  website: z.string().max(200).optional().or(z.literal('')),
  currency: z.string().min(1).max(10),
  primary_color: z.string().min(1),
  secondary_color: z.string().min(1),
  footer_text: z.string().max(1000).optional().or(z.literal('')),
  default_terms: z.string().max(4000).optional().or(z.literal('')),
  payment_instructions: z.string().max(2000).optional().or(z.literal('')),
})
export type OrganizationFormValues = z.infer<typeof organizationSchema>
