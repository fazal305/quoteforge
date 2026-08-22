import { z } from 'zod'
import { getSupabaseAdmin } from './_lib/supabaseAdmin.js'

// Exported for unit testing (see ai-quote-assistant.test.js) — these
// schemas are the actual security/correctness boundary for this endpoint,
// so they're worth testing directly rather than only through the full
// HTTP handler.
export const requestSchema = z.object({
  prompt: z.string().min(10, 'Description is too short').max(2000),
  currency: z.string().min(1).max(10).optional(),
})

// What we require back from the model. Validated before anything touches
// the client — an AI response is untrusted input like any other external
// data source, not a shortcut around normal validation.
export const suggestionSchema = z.object({
  items: z
    .array(
      z.object({
        name: z.string().min(1).max(200),
        description: z.string().max(500).nullable().default(null),
        quantity: z.number().positive().max(100000),
        unit: z.string().min(1).max(50),
        unit_price: z.number().nonnegative().max(100000000),
        tax_percent: z.number().min(0).max(100).default(0),
      })
    )
    .min(1)
    .max(20),
})

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

const DEFAULT_MODEL = 'openai/gpt-4o-mini'

const SYSTEM_PROMPT = `You are a quote-drafting assistant for a business creating a customer quotation.
Given a plain-language description of what a client needs, produce a structured list of
line items (products or services) with realistic, reasonable price estimates.

Respond with ONLY a JSON object of this exact shape, no other text:
{"items":[{"name":"string","description":"string or null","quantity":number,"unit":"string","unit_price":number,"tax_percent":number}]}

Rules:
- 1 to 20 items.
- "unit" examples: "unit", "hour", "month", "project", "page".
- unit_price is a single item's price, not a line total.
- tax_percent is a percentage (0-100), default to 0 if unsure.
- Keep names short (a few words); put detail in description.
- Do not invent a company name, customer name, or dates — only line items.`

/**
 * POST /api/ai-quote-assistant  { prompt, currency? }
 *
 * Proxies to OpenRouter so the API key never reaches the browser. Output
 * is structured and schema-validated here — the frontend NEVER creates a
 * quote directly from this response; it only pre-fills the quote builder
 * for human review (see components/quote-builder/AIQuoteAssistant.jsx).
 */
export default async (req, _context) => {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  // This calls a paid third-party API on every request, so unlike the
  // public quote endpoints it must NOT be reachable anonymously — anyone
  // who found this URL could otherwise run up the OpenRouter bill for
  // free. Require a valid Supabase session (any authenticated user in
  // any org — this doesn't touch tenant data, so no org-scoping needed
  // beyond "is this a real logged-in user").
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    return json({ error: 'You must be signed in to use the AI Quote Assistant.' }, 401)
  }
  const {
    data: { user },
    error: authError,
  } = await getSupabaseAdmin().auth.getUser(token)
  if (authError || !user) {
    return json({ error: 'Your session has expired. Please sign in again.' }, 401)
  }

  // Deliberately NOT named OPENROUTER_API_KEY: Netlify's AI Gateway
  // auto-injects its own gateway JWT into any env var name matching a
  // known AI provider pattern for accounts with AI usage enabled — even
  // if we never set a value ourselves — which silently replaces a real
  // OpenRouter key too. QUOTEFORGE_AI_KEY sidesteps that pattern match.
  const apiKey = (process.env.QUOTEFORGE_AI_KEY || '').trim()
  // Defense in depth: a JWT-shaped value here would still mean the
  // Gateway intercepted it somehow — treat that the same as unconfigured
  // rather than sending it to OpenRouter for a confusing generic failure.
  const looksLikeJwt = apiKey.split('.').length === 3 && apiKey.startsWith('eyJ')
  if (!apiKey || looksLikeJwt) {
    return json(
      { error: 'The AI Quote Assistant is not configured yet. An administrator needs to add an OpenRouter API key.' },
      501
    )
  }

  let parsedRequest
  try {
    parsedRequest = requestSchema.parse(await req.json())
  } catch {
    return json({ error: 'Please describe what the client needs in a bit more detail.' }, 400)
  }

  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL
  const currency = parsedRequest.currency || 'PKR'

  let completion
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://quoteforge.app',
        'X-Title': 'QuoteForge AI Quote Assistant',
      },
      body: JSON.stringify({
        model,
        response_format: { type: 'json_object' },
        temperature: 0.3,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Prices should be in ${currency}. Client needs: ${parsedRequest.prompt}` },
        ],
      }),
      signal: AbortSignal.timeout(20_000),
    })

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '')
      console.error('OpenRouter error:', response.status, errorBody)
      return json({ error: 'The AI service is temporarily unavailable. Please try again shortly.' }, 502)
    }

    completion = await response.json()
  } catch (err) {
    console.error('OpenRouter request failed:', err.message)
    return json({ error: 'The AI service is temporarily unavailable. Please try again shortly.' }, 502)
  }

  const rawContent = completion.choices?.[0]?.message?.content
  if (!rawContent) {
    return json({ error: 'The AI assistant did not return a response. Please try again.' }, 502)
  }

  let candidate
  try {
    candidate = JSON.parse(rawContent)
  } catch {
    return json({ error: "The AI assistant's response couldn't be read. Please try rephrasing your description." }, 502)
  }

  const validated = suggestionSchema.safeParse(candidate)
  if (!validated.success) {
    console.error('AI response failed schema validation:', validated.error.message)
    return json({ error: "The AI assistant's response wasn't in the expected format. Please try again." }, 502)
  }

  return json({ items: validated.data.items })
}

export const config = {
  path: '/api/ai-quote-assistant',
}
