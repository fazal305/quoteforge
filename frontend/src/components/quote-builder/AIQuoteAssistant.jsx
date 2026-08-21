import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { FieldError } from '@/components/ui/Input'
import { useGenerateQuoteSuggestion } from '@/api/aiAssistant'
import { calculateLineItem, calculateQuoteTotals, formatMoney } from '@/lib/money'

/**
 * AI Quote Assistant: turns a plain-language description into draft line
 * items. The suggestion is shown for review here and only added to the
 * quote when the user explicitly clicks "Add to quote" — it never writes
 * to the quote builder's state on its own. The user then edits the added
 * items normally in the regular line-items table like any other item.
 */
export function AIQuoteAssistant({ open, onClose, onAddItems, currency }) {
  const [prompt, setPrompt] = useState('')
  const [suggestion, setSuggestion] = useState(null)
  const generate = useGenerateQuoteSuggestion()

  function handleClose() {
    setPrompt('')
    setSuggestion(null)
    generate.reset()
    onClose()
  }

  async function handleGenerate(e) {
    e.preventDefault()
    if (!prompt.trim()) return
    setSuggestion(null)
    try {
      const items = await generate.mutateAsync({ prompt: prompt.trim(), currency })
      setSuggestion(items)
    } catch {
      // error surfaced via generate.error below
    }
  }

  function handleAdd() {
    if (!suggestion) return
    onAddItems(suggestion)
    handleClose()
  }

  const totals = suggestion ? calculateQuoteTotals({ items: suggestion.map(toLineItemInput) }) : null

  return (
    <Modal open={open} onClose={handleClose} title="AI Quote Assistant">
      <div className="space-y-4">
        <p className="text-sm text-neutral-600">
          Describe what the client needs in plain language. The AI will suggest line items for you to review — it
          never adds anything to the quote automatically.
        </p>

        <form onSubmit={handleGenerate} className="space-y-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="e.g. Client needs a restaurant website with online ordering, admin panel, and one year of hosting."
            className="w-full rounded-md border border-neutral-300 bg-neutral-0 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            disabled={generate.isPending}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={generate.isPending || !prompt.trim()}>
              {generate.isPending ? 'Generating…' : suggestion ? 'Regenerate' : 'Generate suggestion'}
            </Button>
          </div>
        </form>

        <FieldError message={generate.error?.message} />

        {suggestion && (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Suggested items — review before adding
            </div>
            <ul className="divide-y divide-neutral-200">
              {suggestion.map((item, i) => {
                const t = calculateLineItem(toLineItemInput(item))
                return (
                  <li key={i} className="flex items-start justify-between gap-3 py-2 text-sm">
                    <div>
                      <div className="font-medium text-neutral-900">{item.name}</div>
                      {item.description && <div className="text-neutral-500">{item.description}</div>}
                      <div className="text-xs text-neutral-400">
                        {item.quantity} {item.unit} × {formatMoney(item.unit_price, currency)}
                      </div>
                    </div>
                    <div className="whitespace-nowrap font-medium text-neutral-900">{formatMoney(t.lineTotal, currency)}</div>
                  </li>
                )
              })}
            </ul>
            <div className="mt-2 flex justify-between border-t border-neutral-200 pt-2 text-sm font-semibold text-neutral-900">
              <span>Estimated total</span>
              <span>{formatMoney(totals.total, currency)}</span>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            {suggestion ? 'Discard' : 'Cancel'}
          </Button>
          {suggestion && <Button onClick={handleAdd}>Add to quote</Button>}
        </div>
      </div>
    </Modal>
  )
}

function toLineItemInput(item) {
  return {
    quantity: item.quantity,
    unit_price: item.unit_price,
    discount_percent: 0,
    tax_percent: item.tax_percent,
  }
}
