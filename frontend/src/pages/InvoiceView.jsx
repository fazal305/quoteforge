import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { RecordPaymentModal } from '@/components/invoices/RecordPaymentModal'
import { useInvoice, useRecordPayment } from '@/api/invoices'
import { calculateLineItem, formatMoney } from '@/lib/money'

export function InvoiceView() {
  const { id } = useParams()
  const { data, isLoading } = useInvoice(id)
  const recordPayment = useRecordPayment()
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)

  if (isLoading || !data) {
    return <div className="p-6 text-sm text-neutral-500">Loading invoice…</div>
  }

  const { invoice, items, payments } = data
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0)
  const balanceDue = Math.max(Number(invoice.total) - totalPaid, 0)
  const isOverdue = invoice.due_date && new Date(invoice.due_date) < new Date() && !['PAID', 'CANCELLED'].includes(invoice.status)
  const canRecordPayment = !['PAID', 'CANCELLED'].includes(invoice.status)

  async function handleRecordPayment(values) {
    await recordPayment.mutateAsync({
      invoiceId: invoice.id,
      amount: values.amount,
      paidAt: values.paidAt,
      method: values.method || null,
      reference: values.reference || null,
      notes: values.notes || null,
    })
    setPaymentModalOpen(false)
  }

  return (
    <div>
      <PageHeader
        title={invoice.invoice_number}
        description={invoice.customer?.name ?? ''}
        action={
          <div className="flex items-center gap-3">
            {canRecordPayment && <Button size="sm" onClick={() => setPaymentModalOpen(true)}>Record payment</Button>}
            <StatusBadge status={invoice.status} kind="invoice" />
          </div>
        }
      />

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 p-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          {isOverdue && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
              This invoice was due {new Date(invoice.due_date).toLocaleDateString()} and has not been fully paid.
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-neutral-500">
                  <th className="px-4 py-2.5 font-medium">Item</th>
                  <th className="px-4 py-2.5 text-right font-medium">Qty</th>
                  <th className="px-4 py-2.5 text-right font-medium">Unit price</th>
                  <th className="px-4 py-2.5 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const t = calculateLineItem(item)
                  return (
                    <tr key={item.id} className="border-b border-neutral-100 last:border-0">
                      <td className="px-4 py-2.5">
                        <div className="font-medium text-neutral-900">{item.name}</div>
                        {item.description && <div className="text-neutral-500">{item.description}</div>}
                      </td>
                      <td className="px-4 py-2.5 text-right text-neutral-600">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-4 py-2.5 text-right text-neutral-600">{formatMoney(item.unit_price, invoice.currency)}</td>
                      <td className="px-4 py-2.5 text-right text-neutral-900">{formatMoney(t.lineTotal, invoice.currency)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="ml-auto max-w-xs space-y-1 rounded-lg border border-neutral-200 bg-neutral-0 p-4 text-sm">
            <Row label="Subtotal" value={formatMoney(invoice.subtotal, invoice.currency)} />
            <Row label="Discount" value={`− ${formatMoney(invoice.discount_total, invoice.currency)}`} />
            <Row label="Tax" value={formatMoney(invoice.tax_total, invoice.currency)} />
            <div className="border-t border-neutral-200 pt-1">
              <Row label="Total" value={formatMoney(invoice.total, invoice.currency)} bold />
            </div>
            <Row label="Paid" value={formatMoney(totalPaid, invoice.currency)} />
            <div className="border-t border-neutral-200 pt-1">
              <Row label="Balance due" value={formatMoney(balanceDue, invoice.currency)} bold />
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-neutral-900">Payment history</h2>
          {payments.length === 0 ? (
            <p className="text-sm text-neutral-400">No payments recorded yet.</p>
          ) : (
            <ul className="space-y-3">
              {payments.map((p) => (
                <li key={p.id} className="rounded-lg border border-neutral-200 bg-neutral-0 p-3">
                  <div className="flex justify-between text-sm font-medium text-neutral-900">
                    <span>{formatMoney(p.amount, invoice.currency)}</span>
                    <span className="text-neutral-500">{new Date(p.paid_at).toLocaleDateString()}</span>
                  </div>
                  {p.method && <div className="text-xs text-neutral-500">{p.method}</div>}
                  {p.reference && <div className="text-xs text-neutral-400">Ref: {p.reference}</div>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <RecordPaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSubmit={handleRecordPayment}
        maxAmount={balanceDue}
        submitting={recordPayment.isPending}
      />
    </div>
  )
}

function Row({ label, value, bold }) {
  return (
    <div className={`flex justify-between ${bold ? 'text-base font-semibold text-neutral-900' : 'text-neutral-600'}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
