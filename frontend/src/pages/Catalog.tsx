import { PageHeader, EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'

export function Catalog() {
  return (
    <div>
      <PageHeader
        title="Product & Service Catalog"
        description="Reusable line items for faster quote building."
        action={<Button size="sm">New item</Button>}
      />
      <div className="p-6">
        <EmptyState
          title="No catalog items yet"
          description="The catalog is implemented in Phase 2 so items can be selected directly in the quote builder."
        />
      </div>
    </div>
  )
}
