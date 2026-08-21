/**
 * Simple liveness check used to verify the Netlify Functions runtime and
 * environment variables are wired correctly after deploy.
 */
export default async (_req, _context) => {
  return new Response(
    JSON.stringify({
      ok: true,
      hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
      hasSupabaseServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      hasOpenRouterKey: Boolean(process.env.QUOTEFORGE_AI_KEY),
    }),
    { headers: { 'content-type': 'application/json' } }
  )
}

export const config = {
  path: '/api/health',
}
