import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader, EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useQuotes } from '@/api/quotes'
import { useProfile } from '@/api/organization'
import { formatMoney } from '@/lib/money'

const STATUS_FILTERS = [
  'ALL', 'DRAFT', 'SENT', 'VIEWED', 'APPROVED', 'REJECTED', 'CHANGE_REQUESTED', 'EXPIRED', 'CONVERTED',
]

export function Quotes() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const { data: profile } = useProfile()
  const { data: quotes, isLoading, error } = useQuotes({ search, status })
  const currency = profile?.organization.currency ?? 'PKR'

  return (
    <div>
      <PageHeader
        title="Quotes"
        description="All quotations across your business."
        action={
          <Link to="/quotes/new">
            <Button size="sm">New quote</Button>
          </Link>
        }
      />

      <div className="p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="max-w-sm flex-1">
            <Input placeholder="Search by quote number…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search quotes" />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by status"
            className="h-10 rounded-md border border-neutral-300 bg-neutral-0 px-3 text-sm"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All statuses' : s.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {isLoading && <div className="p-6 text-sm text-neutral-500">Loading quotes…</div>}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load quotes: {error.message}
          </div>
        )}

        {!isLoading && !error && quotes?.length === 0 && (
          <EmptyState
            title="No quotes found"
            description="Create your first quote to start the workflow: draft, send, and track approval."
            action={
              <Link to="/quotes/new">
                <Button size="sm">New quote</Button>
              </Link>
            }
          />
        )}

        {!isLoading && quotes && quotes.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-neutral-500">
                  <th className="px-4 py-2.5 font-medium">Quote #</th>
                  <th className="px-4 py-2.5 font-medium">Customer</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Total</th>
                  <th className="px-4 py-2.5 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <tr key={q.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                    <td className="px-4 py-2.5 font-medium text-neutral-900">
                      <Link to={q.status === 'DRAFT' || q.status === 'CHANGE_REQUESTED' ? `/quotes/${q.id}/edit` : `/quotes/${q.id}`} className="hover:underline">
                        {q.quote_number}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-neutral-600">{q.customer?.name ?? '—'}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={q.status} kind="quote" />
                    </td>
                    <td className="px-4 py-2.5 text-neutral-600">{formatMoney(q.total, q.currency || currency)}</td>
                    <td className="px-4 py-2.5 text-neutral-500">{new Date(q.updated_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
