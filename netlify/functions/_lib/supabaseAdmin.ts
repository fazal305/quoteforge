import { createClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client for use ONLY inside Netlify Functions.
 * SUPABASE_SERVICE_ROLE_KEY bypasses Row Level Security — it must never be
 * exposed to the frontend or committed to git. Functions that use this
 * client are responsible for their own authorization checks (e.g.
 * validating a public quote token, or checking the caller's JWT/org).
 */
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY environment variables.')
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  })
}
