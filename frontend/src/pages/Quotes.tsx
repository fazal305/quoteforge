import { PageHeader, EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'

export function Quotes() {
  return (
    <div>
      <PageHeader
        title="Quotes"
        description="All quotations across your business."
        action={<Button size="sm">New quote</Button>}
      />
      <div className="p-6">
        <EmptyState
          title="No quotes yet"
          description="The quote list, search, filtering, and the Quote Builder are implemented in Phase 2."
        />
      </div>
    </div>
  )
}
