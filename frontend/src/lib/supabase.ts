import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  // Fails loudly in dev rather than silently hitting undefined endpoints.
  // A syntactically valid placeholder URL is used below so createClient()
  // doesn't throw at module load and white-screen the whole app — auth
  // calls will simply fail until real credentials are provided.
  console.error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill in your Supabase project values.'
  )
}

/**
 * The Supabase anon key is safe to ship to the client by design — access
 * control is enforced by Postgres Row Level Security policies (see
 * supabase/migrations), not by keeping this key secret. The OpenRouter
 * API key is a different story and must NEVER appear here — see
 * netlify/functions/ai-quote-assistant.ts.
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
)
