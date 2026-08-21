import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CustomerSelect } from '@/components/quote-builder/CustomerSelect'
import { LineItemsEditor } from '@/components/quote-builder/LineItemsEditor'
import { QuoteTotals } from '@/components/quote-builder/QuoteTotals'
import { QuotePreview } from '@/components/quote-builder/QuotePreview'
import { useQuoteBuilder } from '@/components/quote-builder/useQuoteBuilder'
import { useProfile } from '@/api/organization'
import { useQuote, useTransitionQuoteStatus } from '@/api/quotes'
import { useCustomer } from '@/api/customers'

export function QuoteBuilder() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: profile } = useProfile()
  const { data: loadedQuote, isLoading: loadingQuote } = useQuote(id)
  const transitionStatus = useTransitionQuoteStatus()

  const currency = profile?.organization.currency ?? 'PKR'
  const {
    state,
    setState,
    quoteId,
    status,
    autosaveState,
    performSave,
    saving,
  } = useQuoteBuilder({
    organizationId: profile?.organization.id,
    currency,
    existingQuoteId: id ?? null,
    loaded: loadedQuote,
  })

  const { data: selectedCustomer } = useCustomer(state.customerId ?? undefined)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  if (id && loadingQuote) {
    return <div className="p-6 text-sm text-neutral-500">Loading quote…</div>
  }

  const canEdit = status === 'DRAFT' || status === 'CHANGE_REQUESTED'
  const missingCustomer = !state.customerId

  async function handleSaveDraft() {
    try {
      await performSave()
    } catch (err) {
      setSendError((err as Error).message)
    }
  }

  async function handleSend() {
    setSendError(null)
    if (!state.customerId) {
      setSendError('Select a customer before sending.')
      return
    }
    try {
      const saved = await performSave()
      const targetId = quoteId ?? saved?.id
      if (!targetId) return
      await transitionStatus.mutateAsync({
        quoteId: targetId,
        newStatus: 'SENT',
        actorType: 'USER',
        actorLabel: profile?.user.name ?? 'User',
        message: `Quote sent to ${selectedCustomer?.name ?? 'customer'}.`,
        eventType: 'SENT',
      })
      navigate('/quotes')
    } catch (err) {
      setSendError((err as Error).message)
    }
  }

  return (
    <div>
      <PageHeader
        title={loadedQuote?.quote.quote_number ?? 'New quotation'}
        description={
          autosaveState === 'saving'
            ? 'Saving…'
            : autosaveState === 'saved'
              ? 'All changes saved'
              : autosaveState === 'error'
                ? 'Autosave failed — use Save Draft'
                : 'Draft'
        }
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setPreviewOpen(true)} disabled={!state.customerId}>
              Preview
            </Button>
            {canEdit && (
              <Button variant="secondary" onClick={handleSaveDraft} disabled={saving || missingCustomer}>
                Save draft
              </Button>
            )}
            {canEdit && (
              <Button onClick={handleSend} disabled={saving || missingCustomer}>
                Send
              </Button>
            )}
          </div>
        }
      />

      <div className="mx-auto max-w-5xl space-y-6 p-6">
        {!canEdit && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            This quote is {status.toLowerCase().replace('_', ' ')} and can no longer be edited here.
          </div>
        )}

        {sendError && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{sendError}</div>
        )}

        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <label className="mb-1 block text-sm font-medium text-neutral-700">Customer *</label>
          {profile && (
            <CustomerSelect
              organizationId={profile.organization.id}
              value={state.customerId}
              onChange={(customerId) => setState((s) => ({ ...s, customerId }))}
            />
          )}
        </div>

        <LineItemsEditor
          items={state.items}
          onChange={(items) => setState((s) => ({ ...s, items }))}
          currency={currency}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <label className="mb-1 block text-sm font-medium text-neutral-700">Additional discount (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={state.additionalDiscountPercent}
                onChange={(e) => setState((s) => ({ ...s, additionalDiscountPercent: Number(e.target.value) }))}
              />
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <label className="mb-1 block text-sm font-medium text-neutral-700">Quote validity (expires)</label>
              <Input
                type="date"
                value={state.validUntil}
                onChange={(e) => setState((s) => ({ ...s, validUntil: e.target.value }))}
              />
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <label className="mb-1 block text-sm font-medium text-neutral-700">Terms & conditions</label>
              <textarea
                value={state.terms}
                onChange={(e) => setState((s) => ({ ...s, terms: e.target.value }))}
                rows={4}
                placeholder={profile?.organization.default_terms ? 'Using business default terms — edit here to override' : ''}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
              />
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <label className="mb-1 block text-sm font-medium text-neutral-700">Additional notes</label>
              <textarea
                value={state.notes}
                onChange={(e) => setState((s) => ({ ...s, notes: e.target.value }))}
                rows={3}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>

          <QuoteTotals items={state.items} additionalDiscountPercent={state.additionalDiscountPercent} currency={currency} />
        </div>
      </div>

      {profile && (
        <QuotePreview
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          state={state}
          organization={profile.organization}
          customer={selectedCustomer}
          quoteNumber={loadedQuote?.quote.quote_number}
        />
      )}
    </div>
  )
}
