import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, FieldError } from '@/components/ui/Input'
import { useQuote, useQuoteEvents, useQuotePublicToken } from '@/api/quotes'
import { useConvertQuoteToInvoice, useQuoteInvoice } from '@/api/invoices'
import { useProfile } from '@/api/organization'
import { calculateLineItem, formatMoney } from '@/lib/money'
import { downloadQuotePdf } from '@/lib/pdf'

const EVENT_ICON = {
  CREATED: '＋',
  DRAFT_SAVED: '✎',
  SENT: '→',
  VIEWED: '👁',
  APPROVED: '✓',
  REJECTED: '✕',
  CHANGE_REQUESTED: '↺',
  EDITED: '✎',
  RESENT: '→',
  EXPIRED: '⏱',
  CONVERTED: '⇒',
}

export function QuoteView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, error: loadError } = useQuote(id)
  const { data: events } = useQuoteEvents(id)
  const { data: publicToken } = useQuotePublicToken(id)
  const { data: linkedInvoice } = useQuoteInvoice(id)
  const { data: profile } = useProfile()
  const convertToInvoice = useConvertQuoteToInvoice()
  const [copied, setCopied] = useState(false)
  const [convertOpen, setConvertOpen] = useState(false)
  const [dueDate, setDueDate] = useState('')
  const [convertError, setConvertError] = useState('')
  const [pdfError, setPdfError] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)

  if (isLoading) {
    return <div className="p-6 text-sm text-neutral-500">Loading quote…</div>
  }

  if (loadError || !data) {
    return (
      <div className="p-6 text-sm text-red-700" role="alert">
        {loadError ? `Failed to load quote: ${loadError.message}` : 'This quote could not be found.'}
      </div>
    )
  }

  const { quote, items } = data
  const publicUrl = publicToken ? `${window.location.origin}/quote/${publicToken.token}` : null

  async function copyLink() {
    if (!publicUrl) return
    await navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDownloadPdf() {
    if (!profile) return
    setPdfError('')
    setPdfLoading(true)
    try {
      await downloadQuotePdf({
        quote,
        items,
        organization: profile.organization,
        customer: quote.customer ?? { name: 'Customer' },
      })
    } catch (err) {
      setPdfError(err.message)
    } finally {
      setPdfLoading(false)
    }
  }

  async function handleConvert(e) {
    e.preventDefault()
    setConvertError('')
    try {
      const invoice = await convertToInvoice.mutateAsync({ quoteId: quote.id, dueDate })
      navigate(`/invoices/${invoice.id}`)
    } catch (err) {
      setConvertError(err.message)
    }
  }

  return (
    <div>
      <PageHeader
        title={quote.quote_number}
        description={quote.customer?.name ?? ''}
        action={
          <div className="flex items-center gap-3">
            <Button size="sm" variant="secondary" onClick={handleDownloadPdf} disabled={pdfLoading || !profile}>
              {pdfLoading ? 'Preparing PDF…' : 'Download PDF'}
            </Button>
            {quote.status === 'APPROVED' && (
              <Button size="sm" onClick={() => setConvertOpen(true)}>
                Convert to invoice
              </Button>
            )}
            {quote.status === 'CONVERTED' && linkedInvoice && (
              <Link to={`/invoices/${linkedInvoice.id}`} className="text-sm text-brand-600 hover:underline">
                View invoice {linkedInvoice.invoice_number}
              </Link>
            )}
            <StatusBadge status={quote.status} kind="quote" />
          </div>
        }
      />

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 p-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          {pdfError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{pdfError}</div>
          )}

          {publicUrl && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-neutral-0 p-3">
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Customer link</div>
                <div className="truncate text-sm text-neutral-700">{publicUrl}</div>
              </div>
              <Button size="sm" variant="secondary" onClick={copyLink}>
                {copied ? 'Copied!' : 'Copy link'}
              </Button>
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
                      <td className="px-4 py-2.5 text-right text-neutral-600">{formatMoney(item.unit_price, quote.currency)}</td>
                      <td className="px-4 py-2.5 text-right text-neutral-900">{formatMoney(t.lineTotal, quote.currency)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="ml-auto max-w-xs space-y-1 rounded-lg border border-neutral-200 bg-neutral-0 p-4 text-sm">
            <Row label="Subtotal" value={formatMoney(quote.subtotal, quote.currency)} />
            <Row label="Discount" value={`− ${formatMoney(quote.discount_total, quote.currency)}`} />
            <Row label="Tax" value={formatMoney(quote.tax_total, quote.currency)} />
            <div className="border-t border-neutral-200 pt-1">
              <Row label="Total" value={formatMoney(quote.total, quote.currency)} bold />
            </div>
          </div>

          {quote.terms && (
            <div className="rounded-lg border border-neutral-200 bg-neutral-0 p-4 text-sm">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">Terms & conditions</div>
              <div className="whitespace-pre-line text-neutral-600">{quote.terms}</div>
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-neutral-900">Activity</h2>
          <ol className="space-y-4 border-l border-neutral-200 pl-4">
            {events?.map((event) => (
              <li key={event.id} className="relative">
                <span className="absolute -left-[21px] flex h-4 w-4 items-center justify-center rounded-full bg-neutral-100 text-[10px]">
                  {EVENT_ICON[event.type] ?? '•'}
                </span>
                <div className="text-sm text-neutral-800">{event.message}</div>
                <div className="text-xs text-neutral-400">{new Date(event.created_at).toLocaleString()}</div>
              </li>
            ))}
            {(!events || events.length === 0) && <li className="text-sm text-neutral-400">No activity yet.</li>}
          </ol>
        </div>
      </div>

      <Modal open={convertOpen} onClose={() => setConvertOpen(false)} title="Convert to invoice">
        <form onSubmit={handleConvert} className="space-y-4" noValidate>
          <p className="text-sm text-neutral-600">
            Creates an invoice from this quote's approved items and totals. The quote will be marked converted.
          </p>
          <div>
            <label htmlFor="due-date" className="mb-1 block text-sm font-medium text-neutral-700">
              Due date (optional)
            </label>
            <Input id="due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <FieldError message={convertError} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setConvertOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={convertToInvoice.isPending}>
              {convertToInvoice.isPending ? 'Converting…' : 'Convert to invoice'}
            </Button>
          </div>
        </form>
      </Modal>
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
