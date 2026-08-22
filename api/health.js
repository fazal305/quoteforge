/**
 * Simple liveness check used to verify the Vercel Functions runtime and
 * environment variables are wired correctly after deploy.
 *
 * Vercel routes this file to /api/health automatically (file-based
 * routing) — no explicit path config needed, unlike Netlify. Uses the
 * classic (req, res) Node.js handler signature — the Web-standard
 * Request/Response signature (used by the Netlify version of these
 * functions) silently hangs on Vercel's Node runtime instead of erroring,
 * which is a much worse failure mode than an explicit incompatibility.
 */
export default function handler(_req, res) {
  res.status(200).json({
    ok: true,
    hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
    hasSupabaseServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    hasOpenRouterKey: Boolean(process.env.QUOTEFORGE_AI_KEY),
  })
}
