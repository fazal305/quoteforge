import { PageHeader, EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'

export function Customers() {
  return (
    <div>
      <PageHeader
        title="Customers"
        description="Businesses and contacts you send quotes to."
        action={<Button size="sm">New customer</Button>}
      />
      <div className="p-6">
        <EmptyState
          title="No customers yet"
          description="Customer management is implemented in Phase 2, alongside the quote builder."
        />
      </div>
    </div>
  )
}
