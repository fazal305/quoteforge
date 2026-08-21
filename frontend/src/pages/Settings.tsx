import { PageHeader } from '@/components/ui/EmptyState'

export function Settings() {
  return (
    <div>
      <PageHeader title="Business Settings" description="Branding, contact information, and default quote terms." />
      <div className="p-6 text-sm text-neutral-500">
        The business profile form (logo, colors, contact info, default terms/payment instructions
        — see spec section 12) is implemented in Phase 2, once the organizations table is in use.
      </div>
    </div>
  )
}
