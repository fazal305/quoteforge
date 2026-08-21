import clsx from 'clsx'
import type { InvoiceStatus, QuoteStatus } from '@/types/domain'

const QUOTE_LABELS: Record<QuoteStatus, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  VIEWED: 'Viewed',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CHANGE_REQUESTED: 'Changes requested',
  EXPIRED: 'Expired',
  CONVERTED: 'Converted',
}

const INVOICE_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: 'Draft',
  ISSUED: 'Issued',
  PARTIALLY_PAID: 'Partially paid',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  CANCELLED: 'Cancelled',
}

const STATUS_COLOR_VAR: Record<string, string> = {
  DRAFT: 'draft',
  SENT: 'sent',
  VIEWED: 'viewed',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CHANGE_REQUESTED: 'changes',
  EXPIRED: 'expired',
  CONVERTED: 'converted',
  ISSUED: 'sent',
  PARTIALLY_PAID: 'changes',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'rejected',
}

export function StatusBadge({ status, kind = 'quote' }: { status: QuoteStatus | InvoiceStatus; kind?: 'quote' | 'invoice' }) {
  const label = kind === 'quote' ? QUOTE_LABELS[status as QuoteStatus] : INVOICE_LABELS[status as InvoiceStatus]
  const colorKey = STATUS_COLOR_VAR[status]

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium'
      )}
      style={{
        color: `var(--color-status-${colorKey})`,
        borderColor: `color-mix(in srgb, var(--color-status-${colorKey}) 35%, transparent)`,
        backgroundColor: `color-mix(in srgb, var(--color-status-${colorKey}) 10%, transparent)`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: `var(--color-status-${colorKey})` }}
        aria-hidden
      />
      {label}
    </span>
  )
}
