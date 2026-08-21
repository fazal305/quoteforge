import { PageHeader } from '@/components/ui/EmptyState'

export function Dashboard() {
  return (
    <div>
      <PageHeader title="Dashboard" description="Quote pipeline, revenue, and activity at a glance." />
      <div className="p-6 text-sm text-neutral-500">
        Dashboard metrics (pipeline by status, revenue, recent activity) are built in Phase 2
        once quotes and customers exist to report on.
      </div>
    </div>
  )
}
