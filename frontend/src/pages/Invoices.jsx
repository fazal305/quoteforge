import { PageHeader, EmptyState } from '@/components/ui/EmptyState'

export function Invoices() {
  return (
    <div>
      <PageHeader title="Invoices" description="Invoices converted from approved quotes, and payment status." />
      <div className="p-6">
        <EmptyState
          title="No invoices yet"
          description="Invoices are created by converting an approved quote — implemented in Phase 4."
        />
      </div>
    </div>
  )
}
