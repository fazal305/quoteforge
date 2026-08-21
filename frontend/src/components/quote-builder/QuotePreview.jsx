import { Modal } from '@/components/ui/Modal'
import { calculateLineItem, calculateQuoteTotals, formatMoney } from '@/lib/money'

export function QuotePreview({ open, onClose, state, organization, customer, quoteNumber }) {
  const totals = calculateQuoteTotals({ items: state.items, additionalDiscountPercent: state.additionalDiscountPercent })

  return (
    <Modal open={open} onClose={onClose} title="Quote preview">
      <div className="max-h-[70vh] overflow-y-auto rounded-md border border-neutral-200 bg-white p-6 text-sm">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="text-lg font-semibold text-neutral-900">{organization.name}</div>
            <div className="text-neutral-500">{organization.address || '[PLACEHOLDER — business address]'}</div>
            <div className="text-neutral-500">{organization.email || '[PLACEHOLDER — business email]'}</div>
          </div>
          <div className="text-right">
            <div className="text-base font-semibold text-neutral-900">{quoteNumber ?? 'Draft — not yet numbered'}</div>
            <div className="text-neutral-500">Valid until: {state.validUntil || '—'}</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">Bill to</div>
          <div className="font-medium text-neutral-900">{customer?.name ?? '—'}</div>
          {customer?.company && <div className="text-neutral-600">{customer.company}</div>}
          {customer?.email && <div className="text-neutral-600">{customer.email}</div>}
        </div>

        <table className="mb-6 w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-300 text-left text-neutral-500">
              <th className="py-2 font-medium">Item</th>
              <th className="py-2 text-right font-medium">Qty</th>
              <th className="py-2 text-right font-medium">Unit price</th>
              <th className="py-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {state.items.map((item) => {
              const t = calculateLineItem(item)
              return (
                <tr key={item.key} className="border-b border-neutral-100">
                  <td className="py-2">
                    <div className="font-medium text-neutral-900">{item.name || 'Untitled item'}</div>
                    {item.description && <div className="text-neutral-500">{item.description}</div>}
                  </td>
                  <td className="py-2 text-right text-neutral-700">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="py-2 text-right text-neutral-700">{formatMoney(item.unit_price, organization.currency)}</td>
                  <td className="py-2 text-right text-neutral-900">{formatMoney(t.lineTotal, organization.currency)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="ml-auto max-w-xs space-y-1 text-sm">
          <div className="flex justify-between text-neutral-600">
            <span>Subtotal</span>
            <span>{formatMoney(totals.subtotal, organization.currency)}</span>
          </div>
          <div className="flex justify-between text-neutral-600">
            <span>Discount</span>
            <span>− {formatMoney(Number(totals.lineDiscountTotal) + Number(totals.additionalDiscount), organization.currency)}</span>
          </div>
          <div className="flex justify-between text-neutral-600">
            <span>Tax</span>
            <span>{formatMoney(totals.taxTotal, organization.currency)}</span>
          </div>
          <div className="flex justify-between border-t border-neutral-300 pt-1 text-base font-semibold text-neutral-900">
            <span>Total</span>
            <span>{formatMoney(totals.total, organization.currency)}</span>
          </div>
        </div>

        {state.terms && (
          <div className="mt-6">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">Terms & conditions</div>
            <div className="whitespace-pre-line text-neutral-600">{state.terms}</div>
          </div>
        )}
        {state.notes && (
          <div className="mt-4">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">Notes</div>
            <div className="whitespace-pre-line text-neutral-600">{state.notes}</div>
          </div>
        )}
      </div>
    </Modal>
  )
}
