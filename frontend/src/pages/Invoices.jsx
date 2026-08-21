import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader, EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useInvoices } from '@/api/invoices'
import { useProfile } from '@/api/organization'
import { formatMoney } from '@/lib/money'

const STATUS_FILTERS = ['ALL', 'DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED']

export function Invoices() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const { data: profile } = useProfile()
  const { data: invoices, isLoading, error } = useInvoices({ search, status })
  const currency = profile?.organization.currency ?? 'PKR'

  return (
    <div>
      <PageHeader title="Invoices" description="Invoices converted from approved quotes, and payment status." />

      <div className="p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="max-w-sm flex-1">
            <Input placeholder="Search by invoice number…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search invoices" />
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

        {isLoading && <div className="p-6 text-sm text-neutral-500">Loading invoices…</div>}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load invoices: {error.message}
          </div>
        )}

        {!isLoading && !error && invoices?.length === 0 && (
          <EmptyState
            title="No invoices yet"
            description="Invoices are created by converting an approved quote — open a quote marked Approved and click Convert to invoice."
          />
        )}

        {!isLoading && invoices && invoices.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-neutral-500">
                  <th className="px-4 py-2.5 font-medium">Invoice #</th>
                  <th className="px-4 py-2.5 font-medium">Customer</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Total</th>
                  <th className="px-4 py-2.5 font-medium">Due</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                    <td className="px-4 py-2.5 font-medium text-neutral-900">
                      <Link to={`/invoices/${inv.id}`} className="hover:underline">
                        {inv.invoice_number}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-neutral-600">{inv.customer?.name ?? '—'}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={inv.status} kind="invoice" />
                    </td>
                    <td className="px-4 py-2.5 text-neutral-600">{formatMoney(inv.total, inv.currency || currency)}</td>
                    <td className="px-4 py-2.5 text-neutral-500">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}</td>
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
