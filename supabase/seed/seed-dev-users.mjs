// Dev/demo seed script — creates one demo organization and one user per
// role (BUSINESS_OWNER, STAFF) so the app can be logged into locally.
//
// NOT for production use. Credentials here are intentionally simple demo
// values, documented in README.md as [DEMO CREDENTIALS], never real
// business data.
//
// Usage: node supabase/seed/seed-dev-users.mjs
// Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in the environment.

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

function loadEnvFile(path) {
  try {
    const content = readFileSync(path, 'utf-8')
    for (const line of content.split('\n')) {
      const match = line.match(/^([A-Z_]+)=(.*)$/)
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim()
      }
    }
  } catch {
    // no .env file, rely on already-exported env vars
  }
}

loadEnvFile(new URL('../../.env', import.meta.url))

const url = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}

const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false } })

// Dummy data — fake but plausible-looking, using a .test domain (reserved
// for testing per RFC 2606) so it's never mistaken for a real address.
const DEMO_ORG = {
  name: 'FORK Software Agency',
  address: '221B Tech Park Road, Gulberg III, Lahore, Pakistan',
  phone: '+92 300 1234567',
  email: 'hello@forksoftware.test',
  website: 'https://forksoftware.test',
  currency: 'PKR',
  primary_color: '#3b6df0',
  secondary_color: '#14171b',
  footer_text: 'Thank you for your business!',
  default_terms:
    'Quotation valid for 30 days from the date of issue. 50% advance payment required to begin work, remaining balance due on completion. Delivery timelines are estimates and may vary based on project scope changes.',
  payment_instructions:
    'Bank transfer to FORK Software Agency — Account #0123456789, MCB Bank, Gulberg Branch, Lahore. Please include the invoice number as payment reference.',
}

const DEMO_USERS = [
  { email: 'owner@quoteforge.dev', password: 'QuoteForge-Owner-123!', role: 'BUSINESS_OWNER', name: 'Demo Owner' },
  { email: 'staff@quoteforge.dev', password: 'QuoteForge-Staff-123!', role: 'STAFF', name: 'Demo Staff' },
]

async function main() {
  const { data: org, error: orgError } = await admin
    .from('organizations')
    .insert(DEMO_ORG)
    .select()
    .single()

  if (orgError) throw orgError
  console.log(`Created organization: ${org.id}`)

  for (const demoUser of DEMO_USERS) {
    const { data: created, error: authError } = await admin.auth.admin.createUser({
      email: demoUser.email,
      password: demoUser.password,
      email_confirm: true,
    })

    if (authError) throw authError

    const { error: profileError } = await admin.from('users').insert({
      auth_user_id: created.user.id,
      organization_id: org.id,
      role: demoUser.role,
      name: demoUser.name,
      email: demoUser.email,
    })

    if (profileError) throw profileError
    console.log(`Created ${demoUser.role}: ${demoUser.email}`)
  }

  console.log('\nDone. See README.md for demo login credentials.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
