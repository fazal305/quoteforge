import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useDashboard } from '@/api/dashboard'
import { useProfile } from '@/api/organization'
import { formatMoney } from '@/lib/money'

const PIPELINE_ORDER = ['DRAFT', 'SENT', 'VIEWED', 'APPROVED', 'REJECTED', 'CHANGE_REQUESTED']

export function Dashboard() {
  const { data, isLoading, error } = useDashboard()
  const { data: profile } = useProfile()
  const currency = profile?.organization.currency ?? 'PKR'

  return (
    <div>
      <PageHeader title="Dashboard" description="Quote pipeline, revenue, and activity at a glance." />

      <div className="space-y-6 p-6">
        {isLoading && <div className="text-sm text-neutral-500">Loading dashboard…</div>}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
            Failed to load dashboard: {error.message}
          </div>
        )}

        {data && (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {PIPELINE_ORDER.map((status) => (
                <div key={status} className="rounded-lg border border-neutral-200 bg-neutral-0 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                    {status.replace('_', ' ')}
                  </div>
                  <div className="mt-1 text-2xl font-semibold text-neutral-900">
                    {data.countsByStatus[status] ?? 0}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-neutral-200 bg-neutral-0 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Revenue pipeline (sent + viewed)
                </div>
                <div className="mt-1 text-2xl font-semibold text-neutral-900">
                  {formatMoney(data.pipelineTotal, currency)}
                </div>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-0 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Outstanding invoices
                  {data.overdueCount > 0 && <span className="ml-1 text-red-600">({data.overdueCount} overdue)</span>}
                </div>
                <div className="mt-1 text-2xl font-semibold text-neutral-900">
                  {formatMoney(data.outstandingTotal, currency)}
                </div>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-0 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-neutral-400">Paid to date</div>
                <div className="mt-1 text-2xl font-semibold text-neutral-900">{formatMoney(data.paidTotal, currency)}</div>
              </div>
            </div>

            {data.needsAttention.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h2 className="mb-2 text-sm font-semibold text-amber-900">Needs attention</h2>
                <ul className="space-y-1">
                  {data.needsAttention.map((q) => (
                    <li key={q.id} className="text-sm text-amber-800">
                      <Link to={q.status === 'CHANGE_REQUESTED' ? `/quotes/${q.id}/edit` : `/quotes/${q.id}`} className="hover:underline">
                        {q.quote_number}
                      </Link>{' '}
                      — {q.customer?.name} —{' '}
                      {q.status === 'CHANGE_REQUESTED' ? 'customer requested changes' : 'expired while awaiting response'}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h2 className="mb-3 text-sm font-semibold text-neutral-900">Recent quotes</h2>
              {data.recentQuotes.length === 0 ? (
                <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-0 p-8 text-center text-sm text-neutral-500">
                  No quotes yet.{' '}
                  <Link to="/quotes/new" className="text-brand-600 hover:underline">
                    Create your first quote
                  </Link>
                  .
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200 text-left text-neutral-500">
                        <th className="px-4 py-2.5 font-medium">Quote #</th>
                        <th className="px-4 py-2.5 font-medium">Customer</th>
                        <th className="px-4 py-2.5 font-medium">Status</th>
                        <th className="px-4 py-2.5 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentQuotes.map((q) => (
                        <tr key={q.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                          <td className="px-4 py-2.5 font-medium text-neutral-900">
                            <Link to={q.status === 'DRAFT' ? `/quotes/${q.id}/edit` : `/quotes/${q.id}`} className="hover:underline">
                              {q.quote_number}
                            </Link>
                          </td>
                          <td className="px-4 py-2.5 text-neutral-600">{q.customer?.name ?? '—'}</td>
                          <td className="px-4 py-2.5">
                            <StatusBadge status={q.status} kind="quote" />
                          </td>
                          <td className="px-4 py-2.5 text-neutral-600">{formatMoney(q.total, q.currency || currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
