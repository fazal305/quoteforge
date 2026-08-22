import { z } from 'zod'
import { createElement as h } from 'react'
import { renderToBuffer, Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { calculateLineItem, formatMoney } from './_lib/money.js'

// Plain .js (not .jsx) with React.createElement rather than JSX syntax:
// Netlify's function file-discovery doesn't recognize .jsx as a valid
// function entry point, so JSX here would silently 404 instead of erroring.

// This endpoint is intentionally unauthenticated (public quote customers
// need it too — see the module docstring below), so every field is
// length- and count-bounded as a resource-exhaustion guard: nothing here
// should let a request force an arbitrarily large or slow PDF render.
const itemSchema = z.object({
  name: z.string().max(200),
  description: z.string().max(1000).nullable().optional(),
  quantity: z.union([z.number(), z.string()]),
  unit: z.string().max(50),
  unit_price: z.union([z.number(), z.string()]),
  discount_percent: z.union([z.number(), z.string()]).optional().default(0),
  tax_percent: z.union([z.number(), z.string()]).optional().default(0),
})

const bodySchema = z.object({
  quote: z.object({
    quote_number: z.string().max(50),
    status: z.string().max(30),
    currency: z.string().max(10),
    subtotal: z.union([z.number(), z.string()]),
    discount_total: z.union([z.number(), z.string()]),
    tax_total: z.union([z.number(), z.string()]),
    total: z.union([z.number(), z.string()]),
    valid_until: z.string().max(40).nullable().optional(),
    notes: z.string().max(4000).nullable().optional(),
    terms: z.string().max(4000).nullable().optional(),
    created_at: z.string().max(40).optional(),
  }),
  items: z.array(itemSchema).min(1).max(200),
  organization: z.object({
    name: z.string().max(200),
    address: z.string().max(500).nullable().optional(),
    phone: z.string().max(50).nullable().optional(),
    email: z.string().max(200).nullable().optional(),
    website: z.string().max(200).nullable().optional(),
    footer_text: z.string().max(1000).nullable().optional(),
    payment_instructions: z.string().max(2000).nullable().optional(),
    primary_color: z.string().max(20).nullable().optional(),
  }),
  customer: z.object({
    name: z.string().max(200),
    company: z.string().max(200).nullable().optional(),
    email: z.string().max(200).nullable().optional(),
  }),
})

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: '#23272e', fontFamily: 'Helvetica' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  orgName: { fontSize: 16, fontWeight: 700, marginBottom: 4 },
  muted: { color: '#6b7684' },
  quoteNumber: { fontSize: 13, fontWeight: 700, textAlign: 'right', marginBottom: 4 },
  section: { marginBottom: 16 },
  sectionLabel: { fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.5, color: '#9aa4b2', marginBottom: 4 },
  table: { marginBottom: 16 },
  tableHeaderRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#cbd2dc', paddingBottom: 6, marginBottom: 6 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#e3e7ed', paddingVertical: 6 },
  colItem: { flex: 3 },
  colQty: { flex: 1, textAlign: 'right' },
  colPrice: { flex: 1.2, textAlign: 'right' },
  colTotal: { flex: 1.2, textAlign: 'right' },
  th: { fontSize: 8, textTransform: 'uppercase', color: '#6b7684' },
  itemName: { fontWeight: 700 },
  itemDescription: { color: '#6b7684', marginTop: 2 },
  totalsBlock: { alignSelf: 'flex-end', width: 220, marginBottom: 20 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  totalsRowFinal: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 6, marginTop: 4, borderTopWidth: 1, borderTopColor: '#23272e' },
  totalsLabelFinal: { fontSize: 11, fontWeight: 700 },
  totalsValueFinal: { fontSize: 11, fontWeight: 700 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#9aa4b2' },
  pageNumber: { position: 'absolute', bottom: 30, right: 40, fontSize: 8, color: '#9aa4b2' },
})

function buildQuotePdfDocument({ quote, items, organization, customer }) {
  const headerLeft = [
    h(Text, { key: 'name', style: styles.orgName }, organization.name),
    organization.address && h(Text, { key: 'addr', style: styles.muted }, organization.address),
    organization.email && h(Text, { key: 'email', style: styles.muted }, organization.email),
    organization.phone && h(Text, { key: 'phone', style: styles.muted }, organization.phone),
  ].filter(Boolean)

  const headerRight = [
    h(Text, { key: 'num', style: styles.quoteNumber }, quote.quote_number),
    quote.created_at &&
      h(Text, { key: 'issued', style: styles.muted }, `Issued ${new Date(quote.created_at).toLocaleDateString()}`),
    quote.valid_until &&
      h(Text, { key: 'valid', style: styles.muted }, `Valid until ${new Date(quote.valid_until).toLocaleDateString()}`),
  ].filter(Boolean)

  const itemRows = items.map((item, i) => {
    const t = calculateLineItem(item)
    return h(
      View,
      { key: i, style: styles.tableRow },
      h(
        View,
        { style: styles.colItem },
        h(Text, { style: styles.itemName }, item.name),
        item.description && h(Text, { style: styles.itemDescription }, item.description)
      ),
      h(Text, { style: styles.colQty }, `${item.quantity} ${item.unit}`),
      h(Text, { style: styles.colPrice }, formatMoney(item.unit_price, quote.currency)),
      h(Text, { style: styles.colTotal }, formatMoney(t.lineTotal, quote.currency))
    )
  })

  const customerBlock = h(
    View,
    { style: styles.section },
    h(Text, { style: styles.sectionLabel }, 'Prepared for'),
    h(Text, { style: { fontWeight: 700 } }, customer.name),
    customer.company && h(Text, { style: styles.muted }, customer.company)
  )

  const totalsBlock = h(
    View,
    { style: styles.totalsBlock },
    h(
      View,
      { style: styles.totalsRow },
      h(Text, { style: styles.muted }, 'Subtotal'),
      h(Text, null, formatMoney(quote.subtotal, quote.currency))
    ),
    h(
      View,
      { style: styles.totalsRow },
      h(Text, { style: styles.muted }, 'Discount'),
      h(Text, null, `− ${formatMoney(quote.discount_total, quote.currency)}`)
    ),
    h(
      View,
      { style: styles.totalsRow },
      h(Text, { style: styles.muted }, 'Tax'),
      h(Text, null, formatMoney(quote.tax_total, quote.currency))
    ),
    h(
      View,
      { style: styles.totalsRowFinal },
      h(Text, { style: styles.totalsLabelFinal }, 'Total'),
      h(Text, { style: styles.totalsValueFinal }, formatMoney(quote.total, quote.currency))
    )
  )

  const extraSections = [
    quote.terms &&
      h(
        View,
        { key: 'terms', style: styles.section },
        h(Text, { style: styles.sectionLabel }, 'Terms & conditions'),
        h(Text, null, quote.terms)
      ),
    quote.notes &&
      h(
        View,
        { key: 'notes', style: styles.section },
        h(Text, { style: styles.sectionLabel }, 'Notes'),
        h(Text, null, quote.notes)
      ),
    organization.payment_instructions &&
      h(
        View,
        { key: 'payment', style: styles.section },
        h(Text, { style: styles.sectionLabel }, 'Payment'),
        h(Text, null, organization.payment_instructions)
      ),
  ].filter(Boolean)

  return h(
    Document,
    { title: `Quote ${quote.quote_number}` },
    h(
      Page,
      { size: 'A4', style: styles.page },
      h(View, { style: styles.headerRow }, h(View, null, ...headerLeft), h(View, null, ...headerRight)),
      customerBlock,
      h(
        View,
        { style: styles.table },
        h(
          View,
          { style: styles.tableHeaderRow },
          h(Text, { style: [styles.colItem, styles.th] }, 'Item'),
          h(Text, { style: [styles.colQty, styles.th] }, 'Qty'),
          h(Text, { style: [styles.colPrice, styles.th] }, 'Unit price'),
          h(Text, { style: [styles.colTotal, styles.th] }, 'Total')
        ),
        ...itemRows
      ),
      totalsBlock,
      ...extraSections,
      organization.footer_text && h(Text, { style: styles.footer }, organization.footer_text),
      h(Text, {
        style: styles.pageNumber,
        render: ({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`,
        fixed: true,
      })
    )
  )
}

/**
 * POST /api/render-quote-pdf  { quote, items, organization, customer }
 *
 * Stateless: takes already-fetched, already-authorized data (from either
 * the authenticated business view via RLS, or the public token-validated
 * view via public-quote.js) and turns it into a PDF. Doesn't touch
 * Supabase itself, so it needs no separate authorization logic — whoever
 * could read the quote data in the first place can render it as a PDF.
 */
export default async (req, _context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json' },
    })
  }

  let parsed
  try {
    parsed = bodySchema.parse(await req.json())
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid quote data', details: err.message }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  try {
    const buffer = await renderToBuffer(buildQuotePdfDocument(parsed))
    return new Response(buffer, {
      status: 200,
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': `inline; filename="${parsed.quote.quote_number}.pdf"`,
      },
    })
  } catch (err) {
    console.error('PDF render failed:', err)
    return new Response(JSON.stringify({ error: 'Could not generate the PDF. Please try again.' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}

export const config = {
  path: '/api/render-quote-pdf',
}
