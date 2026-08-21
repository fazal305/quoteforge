import { calculateQuoteTotals, formatMoney } from '@/lib/money'

export function QuoteTotals({ items, additionalDiscountPercent, currency }) {
  const totals = calculateQuoteTotals({ items, additionalDiscountPercent })

  return (
    <div className="space-y-2 rounded-lg border border-neutral-200 bg-neutral-0 p-4 text-sm">
      <Row label="Subtotal" value={formatMoney(totals.subtotal, currency)} />
      <Row label="Line discounts" value={`− ${formatMoney(totals.lineDiscountTotal, currency)}`} muted />
      {Number(additionalDiscountPercent) > 0 && (
        <Row label={`Additional discount (${additionalDiscountPercent}%)`} value={`− ${formatMoney(totals.additionalDiscount, currency)}`} muted />
      )}
      <Row label="Tax" value={formatMoney(totals.taxTotal, currency)} muted />
      <div className="border-t border-neutral-200 pt-2">
        <Row label="Total" value={formatMoney(totals.total, currency)} bold />
      </div>
    </div>
  )
}

function Row({ label, value, muted, bold }) {
  return (
    <div className={`flex justify-between ${muted ? 'text-neutral-500' : 'text-neutral-800'} ${bold ? 'text-base font-semibold text-neutral-900' : ''}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
