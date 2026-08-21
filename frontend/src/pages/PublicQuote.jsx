import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { calculateLineItem, formatMoney } from '@/lib/money'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, FieldError } from '@/components/ui/Input'

const READ_ONLY_STATUSES = new Set(['APPROVED', 'REJECTED', 'CHANGE_REQUESTED', 'EXPIRED', 'CONVERTED'])

const STATUS_MESSAGE = {
  APPROVED: '✓ You approved this quotation.',
  REJECTED: 'You declined this quotation.',
  CHANGE_REQUESTED: 'You requested changes to this quotation. The business has been notified.',
  EXPIRED: 'This quotation has expired.',
  CONVERTED: 'This quotation has already been converted to an invoice.',
}

/**
 * Public, unauthenticated quote view: /quote/:token
 * Fetches through a Netlify Function (no Supabase session exists here —
 * see netlify/functions/public-quote.js) and only ever shows fields that
 * function chose to expose. Never fetch quote data directly from Supabase
 * on this page.
 */
export function PublicQuote() {
  const { token } = useParams()
  const [data, setData] = useState(null)
  const [loadState, setLoadState] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [actionModal, setActionModal] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`/api/public-quote?token=${encodeURIComponent(token)}`)
        const body = await res.json()
        if (cancelled) return
        if (!res.ok) {
          setErrorMessage(body.error || 'Something went wrong.')
          setLoadState('error')
          return
        }
        setData(body)
        setLoadState('ready')
      } catch {
        if (!cancelled) {
          setErrorMessage('Could not load this quote. Check your connection and try again.')
          setLoadState('error')
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [token])

  function handleResponded(newStatus) {
    setData((d) => (d ? { ...d, quote: { ...d.quote, status: newStatus } } : d))
    setActionModal(null)
  }

  if (loadState === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-neutral-500">Loading quote…</div>
    )
  }

  if (loadState === 'error') {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-sm text-neutral-600">{errorMessage}</p>
      </div>
    )
  }

  const { quote, items, organization, customer } = data
  const accent = organization?.primary_color || '#3b6df0'
  const isReadOnly = READ_ONLY_STATUSES.has(quote.status)

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl rounded-lg border border-neutral-200 bg-neutral-0 shadow-sm">
        <div className="border-b border-neutral-200 p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <div className="text-lg font-semibold text-neutral-900">
                {organization?.name || '[PLACEHOLDER — business name]'}
              </div>
              {organization?.address && <div className="mt-1 text-sm text-neutral-500">{organization.address}</div>}
              {organization?.email && <div className="text-sm text-neutral-500">{organization.email}</div>}
              {organization?.phone && <div className="text-sm text-neutral-500">{organization.phone}</div>}
            </div>
            <div className="text-left sm:text-right">
              <div className="text-base font-semibold text-neutral-900">{quote.quote_number}</div>
              <div className="text-sm text-neutral-500">Issued {new Date(quote.created_at).toLocaleDateString()}</div>
              {quote.valid_until && (
                <div className="text-sm text-neutral-500">Valid until {new Date(quote.valid_until).toLocaleDateString()}</div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {isReadOnly && (
            <div
              className="mb-6 rounded-md border p-3 text-sm"
              style={{ borderColor: `color-mix(in srgb, ${accent} 35%, transparent)`, backgroundColor: `color-mix(in srgb, ${accent} 8%, transparent)`, color: accent }}
            >
              {STATUS_MESSAGE[quote.status]}
            </div>
          )}

          {customer && (
            <div className="mb-6">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">Prepared for</div>
              <div className="font-medium text-neutral-900">{customer.name}</div>
              {customer.company && <div className="text-neutral-600">{customer.company}</div>}
            </div>
          )}

          <div className="overflow-x-auto">
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
                {items.map((item, i) => {
                  const t = calculateLineItem(item)
                  return (
                    <tr key={i} className="border-b border-neutral-100">
                      <td className="py-2">
                        <div className="font-medium text-neutral-900">{item.name}</div>
                        {item.description && <div className="text-neutral-500">{item.description}</div>}
                      </td>
                      <td className="py-2 text-right text-neutral-700">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-2 text-right text-neutral-700">{formatMoney(item.unit_price, quote.currency)}</td>
                      <td className="py-2 text-right text-neutral-900">{formatMoney(t.lineTotal, quote.currency)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="ml-auto max-w-xs space-y-1 text-sm">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal</span>
              <span>{formatMoney(quote.subtotal, quote.currency)}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Discount</span>
              <span>− {formatMoney(quote.discount_total, quote.currency)}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Tax</span>
              <span>{formatMoney(quote.tax_total, quote.currency)}</span>
            </div>
            <div className="flex justify-between border-t border-neutral-300 pt-1 text-base font-semibold text-neutral-900">
              <span>Total</span>
              <span>{formatMoney(quote.total, quote.currency)}</span>
            </div>
          </div>

          {quote.terms && (
            <div className="mt-6 text-sm">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">Terms & conditions</div>
              <div className="whitespace-pre-line text-neutral-600">{quote.terms}</div>
            </div>
          )}
          {quote.notes && (
            <div className="mt-4 text-sm">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">Notes</div>
              <div className="whitespace-pre-line text-neutral-600">{quote.notes}</div>
            </div>
          )}
          {organization?.payment_instructions && (
            <div className="mt-4 text-sm">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">Payment</div>
              <div className="whitespace-pre-line text-neutral-600">{organization.payment_instructions}</div>
            </div>
          )}
        </div>

        {!isReadOnly && (
          <div className="flex flex-col gap-2 border-t border-neutral-200 p-6 sm:flex-row sm:justify-end sm:p-8">
            <Button variant="secondary" onClick={() => setActionModal('REJECT')}>
              Reject
            </Button>
            <Button variant="secondary" onClick={() => setActionModal('CHANGE_REQUEST')}>
              Request changes
            </Button>
            <Button style={{ backgroundColor: accent }} onClick={() => setActionModal('APPROVE')}>
              Approve quote
            </Button>
          </div>
        )}
      </div>

      {organization?.footer_text && (
        <p className="mx-auto mt-6 max-w-3xl text-center text-xs text-neutral-400">{organization.footer_text}</p>
      )}

      <ResponseModal
        key={actionModal}
        action={actionModal}
        token={token}
        quoteNumber={quote.quote_number}
        onClose={() => setActionModal(null)}
        onSuccess={handleResponded}
      />
    </div>
  )
}

const ACTION_COPY = {
  APPROVE: {
    title: 'Approve quotation',
    confirmLabel: 'Confirm approval',
    description: 'By confirming, you approve this quotation as presented.',
    requireMessage: false,
  },
  REJECT: {
    title: 'Reject quotation',
    confirmLabel: 'Confirm rejection',
    description: 'Let the business know you will not be proceeding with this quotation.',
    requireMessage: false,
  },
  CHANGE_REQUEST: {
    title: 'Request changes',
    confirmLabel: 'Send request',
    description: 'Describe what you would like changed. The business will review and can resend an updated quote.',
    requireMessage: true,
  },
}

function ResponseModal({ action, token, quoteNumber, onClose, onSuccess }) {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!action) return null
  const copy = ACTION_COPY[action]

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Please enter your name.')
      return
    }
    if (copy.requireMessage && !message.trim()) {
      setError('Please describe the changes you need.')
      return
    }
    if (action === 'APPROVE' && !confirmed) {
      setError('Please confirm you have authority to approve this quotation.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/quote-response', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, action, customerName: name.trim(), message: message.trim() || undefined }),
      })
      const body = await res.json()
      if (!res.ok) {
        setError(body.error || 'Something went wrong. Please try again.')
        setSubmitting(false)
        return
      }
      onSuccess(body.status)
    } catch {
      setError('Could not send your response. Check your connection and try again.')
      setSubmitting(false)
    }
  }

  return (
    <Modal open={!!action} onClose={onClose} title={copy.title}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <p className="text-sm text-neutral-600">{copy.description}</p>
        <p className="text-xs text-neutral-400">Quotation {quoteNumber}</p>

        <div>
          <label htmlFor="pq-name" className="mb-1 block text-sm font-medium text-neutral-700">
            Your name *
          </label>
          <Input id="pq-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        {(copy.requireMessage || action === 'REJECT') && (
          <div>
            <label htmlFor="pq-message" className="mb-1 block text-sm font-medium text-neutral-700">
              {action === 'CHANGE_REQUEST' ? 'What would you like changed? *' : 'Reason (optional)'}
            </label>
            <textarea
              id="pq-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-neutral-300 bg-neutral-0 px-3 py-2 text-sm"
            />
          </div>
        )}

        {action === 'APPROVE' && (
          <label className="flex items-start gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5"
            />
            I confirm I have the authority to approve this quotation on behalf of my organization.
          </label>
        )}

        <FieldError message={error} />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Submitting…' : copy.confirmLabel}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
