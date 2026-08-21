import type { Config, Context } from '@netlify/functions'

/**
 * Simple liveness check used to verify the Netlify Functions runtime and
 * environment variables are wired correctly after deploy.
 */
export default async (_req: Request, _context: Context) => {
  return new Response(
    JSON.stringify({
      ok: true,
      hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
      hasSupabaseServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      hasOpenRouterKey: Boolean(process.env.OPENROUTER_API_KEY),
    }),
    { headers: { 'content-type': 'application/json' } }
  )
}

export const config: Config = {
  path: '/api/health',
}
