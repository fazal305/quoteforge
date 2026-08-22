import { getSupabaseAdmin } from '../netlify/functions/_lib/supabaseAdmin.js'

/**
 * Public, unauthenticated quote lookup by token: GET /api/public-quote?token=...
 *
 * Uses the service-role client because the anon role has no RLS access to
 * quotes/customers by design (see supabase/migrations/0001_init.sql) — this
 * function is the only sanctioned path to customer-facing quote data, and
 * it hand-picks which fields to return so internal IDs and unrelated
 * records are never exposed.
 *
 * Shares its implementation with netlify/functions/public-quote.js — this
 * file exists only because Vercel's function routing/runtime conventions
 * differ from Netlify's; the logic is identical. Uses Vercel's classic
 * (req, res) Node.js handler signature — the Web-standard Request/Response
 * signature silently hangs on Vercel's Node runtime.
 */
export default async function handler(req, res) {
  const json = (body, status = 200) => res.status(status).json(body)

  const token = req.query.token

  if (!token) {
    return json({ error: 'Missing token' }, 400)
  }

  const admin = getSupabaseAdmin()

  const { data: tokenRow, error: tokenError } = await admin
    .from('quote_public_tokens')
    .select('quote_id, expires_at')
    .eq('token', token)
    .maybeSingle()

  if (tokenError) {
    return json({ error: 'Lookup failed' }, 500)
  }
  if (!tokenRow) {
    return json({ error: 'Quote not found' }, 404)
  }
  if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) {
    return json({ error: 'This link has expired' }, 410)
  }

  const { data: quote, error: quoteError } = await admin
    .from('quotes')
    .select('*, organization:organizations(*), customer:customers(id, name, company, email)')
    .eq('id', tokenRow.quote_id)
    .single()

  if (quoteError || !quote) {
    return json({ error: 'Quote not found' }, 404)
  }

  const { data: items, error: itemsError } = await admin
    .from('quote_items')
    .select('name, description, quantity, unit, unit_price, discount_percent, tax_percent, line_total, sort_order')
    .eq('quote_id', quote.id)
    .order('sort_order')

  if (itemsError) {
    return json({ error: 'Lookup failed' }, 500)
  }

  // First open: SENT -> VIEWED. Best-effort — a race between two near-
  // simultaneous opens could double-log a VIEWED event, which is a
  // cosmetic activity-feed duplicate, not a correctness issue.
  if (quote.status === 'SENT') {
    await admin.rpc('transition_quote_status', {
      p_quote_id: quote.id,
      p_new_status: 'VIEWED',
      p_actor_type: 'CUSTOMER',
      p_actor_label: quote.customer?.name ?? 'Customer',
      p_message: `${quote.customer?.name ?? 'Customer'} viewed the quote.`,
      p_event_type: 'VIEWED',
    })
    quote.status = 'VIEWED'
  }

  return json({
    quote: {
      quote_number: quote.quote_number,
      status: quote.status,
      currency: quote.currency,
      subtotal: quote.subtotal,
      discount_total: quote.discount_total,
      tax_total: quote.tax_total,
      total: quote.total,
      valid_until: quote.valid_until,
      notes: quote.notes,
      terms: quote.terms,
      created_at: quote.created_at,
    },
    items,
    organization: quote.organization
      ? {
          name: quote.organization.name,
          logo_url: quote.organization.logo_url,
          address: quote.organization.address,
          phone: quote.organization.phone,
          email: quote.organization.email,
          website: quote.organization.website,
          primary_color: quote.organization.primary_color,
          footer_text: quote.organization.footer_text,
          payment_instructions: quote.organization.payment_instructions,
        }
      : null,
    customer: quote.customer ? { name: quote.customer.name, company: quote.customer.company } : null,
  })
}
