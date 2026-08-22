import { z } from 'zod'
import { getSupabaseAdmin } from '../netlify/functions/_lib/supabaseAdmin.js'

// Exported for unit testing (see tests/quote-response.test.js — imports
// from netlify/functions/quote-response.js, which defines the identical
// schema; kept here too so this file is self-contained).
export const bodySchema = z.object({
  token: z.string().min(1),
  action: z.enum(['APPROVE', 'REJECT', 'CHANGE_REQUEST']),
  customerName: z.string().min(1).max(200),
  message: z.string().max(2000).optional(),
})

const ACTION_CONFIG = {
  APPROVE: { status: 'APPROVED', eventType: 'APPROVED' },
  REJECT: { status: 'REJECTED', eventType: 'REJECTED' },
  CHANGE_REQUEST: { status: 'CHANGE_REQUESTED', eventType: 'CHANGE_REQUESTED' },
}

/**
 * Public quote response endpoint: POST /api/quote-response
 * Body: { token, action, customerName, message? }
 *
 * No Supabase session exists for the customer — authorization is entirely
 * "do you have the secure token", validated server-side against
 * quote_public_tokens using the service-role client. The valid-transition
 * check inside transition_quote_status is the actual enforcement; the
 * status check here just returns a clean error instead of a raw DB one.
 *
 * Shares its implementation with netlify/functions/quote-response.js —
 * this file exists only because Vercel's function routing/runtime
 * conventions differ from Netlify's; the logic is identical, aside from
 * reading the client IP from Vercel's x-forwarded-for header instead of
 * Netlify's context.ip. Uses Vercel's classic (req, res) Node.js handler
 * signature — the Web-standard Request/Response signature silently hangs
 * on Vercel's Node runtime.
 */
export default async function handler(req, res) {
  const json = (body, status = 200) => res.status(status).json(body)

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  let parsed
  try {
    parsed = bodySchema.parse(req.body)
  } catch {
    return json({ error: 'Invalid request' }, 400)
  }

  const { token, action, customerName, message } = parsed
  const admin = getSupabaseAdmin()

  const { data: tokenRow, error: tokenError } = await admin
    .from('quote_public_tokens')
    .select('quote_id, expires_at')
    .eq('token', token)
    .maybeSingle()

  if (tokenError) return json({ error: 'Lookup failed' }, 500)
  if (!tokenRow) return json({ error: 'Quote not found' }, 404)
  if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) {
    return json({ error: 'This link has expired' }, 410)
  }

  const { data: quote, error: quoteError } = await admin
    .from('quotes')
    .select('id, status, quote_number, customer:customers(name)')
    .eq('id', tokenRow.quote_id)
    .single()

  if (quoteError || !quote) return json({ error: 'Quote not found' }, 404)

  if (!['SENT', 'VIEWED'].includes(quote.status)) {
    return json({ error: `This quote is ${quote.status.toLowerCase()} and no longer accepts a response.` }, 409)
  }

  const config = ACTION_CONFIG[action]

  const messages = {
    APPROVE: `${customerName} approved quotation #${quote.quote_number}.`,
    REJECT: `${customerName} rejected quotation #${quote.quote_number}.`,
    CHANGE_REQUEST: `${customerName} requested changes: ${message || '(no message provided)'}`,
  }

  // Minimal audit trail on approval only — the action with real business/
  // legal weight. Reject and change-request keep just the customer's own
  // message; no IP/user-agent collected there (data minimization).
  const metadata =
    action === 'APPROVE'
      ? {
          customerName,
          ip: req.headers['x-forwarded-for'] ?? req.headers['x-real-ip'] ?? null,
          userAgent: req.headers['user-agent'] ?? null,
        }
      : { customerName }

  const { data, error } = await admin.rpc('transition_quote_status', {
    p_quote_id: quote.id,
    p_new_status: config.status,
    p_actor_type: 'CUSTOMER',
    p_actor_label: customerName,
    p_message: messages[action],
    p_event_type: config.eventType,
    p_metadata: metadata,
  })

  if (error) {
    return json({ error: 'Could not record your response. Please try again.' }, 500)
  }

  return json({ status: data.status })
}
