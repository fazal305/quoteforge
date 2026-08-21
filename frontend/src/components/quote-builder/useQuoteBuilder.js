import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { calculateQuoteTotals } from '@/lib/money'
import { useSaveQuote } from '@/api/quotes'
import { newLineItem } from './LineItemsEditor'

const EMPTY_STATE = {
  customerId: null,
  items: [newLineItem()],
  additionalDiscountPercent: 0,
  validUntil: '',
  notes: '',
  terms: '',
}

function storageKey(id) {
  return `quoteforge-draft-${id}`
}

function fromQuoteRow(quote, items) {
  return {
    customerId: quote.customer_id,
    items: items.map((item) => ({
      key: item.id,
      catalog_item_id: item.catalog_item_id,
      name: item.name,
      description: item.description ?? '',
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
      discount_percent: item.discount_percent,
      tax_percent: item.tax_percent,
    })),
    additionalDiscountPercent: 0,
    validUntil: quote.valid_until ?? '',
    notes: quote.notes ?? '',
    terms: quote.terms ?? '',
  }
}

/**
 * Manages quote builder state: local edits, autosave-while-draft, a
 * localStorage backup so a dropped connection or accidental refresh
 * doesn't lose in-progress work, and unsaved-changes protection on
 * navigation away. A quote is only durably saved once the Supabase
 * mutation succeeds — the localStorage copy is a recovery aid, not a
 * substitute, and is cleared immediately after a confirmed save.
 */
export function useQuoteBuilder(params) {
  const { organizationId, currency, existingQuoteId, loaded } = params
  const navigate = useNavigate()
  const saveQuote = useSaveQuote()

  const [quoteId, setQuoteId] = useState(existingQuoteId)
  const [status, setStatus] = useState(loaded?.quote.status ?? 'DRAFT')
  // For a brand-new quote (no existingQuoteId), recover any local backup
  // immediately. For an existing quote, wait for the real fetch to resolve
  // (below) rather than risk showing an unrelated quote's local backup.
  const [state, setState] = useState(() => {
    if (existingQuoteId) return EMPTY_STATE
    const saved = typeof window !== 'undefined' ? localStorage.getItem(storageKey('new')) : null
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // corrupt local draft, ignore
      }
    }
    return EMPTY_STATE
  })

  const [autosaveState, setAutosaveState] = useState('idle')
  const lastSavedRef = useRef(JSON.stringify(state))
  const debounceRef = useRef(null)

  // `loaded` arrives asynchronously (useQuote fetch), so on a hard reload /
  // direct navigation to an edit URL it is still undefined on first render —
  // the useState initializer above only runs once and would otherwise miss
  // it. Hydrate here as soon as it arrives, but only once, so it doesn't
  // clobber in-progress edits on later refetches (e.g. after autosave).
  const hydratedRef = useRef(false)
  useEffect(() => {
    if (loaded && !hydratedRef.current) {
      hydratedRef.current = true
      const hydrated = fromQuoteRow(loaded.quote, loaded.items)
      setState(hydrated)
      setStatus(loaded.quote.status)
      setQuoteId(loaded.quote.id)
      lastSavedRef.current = JSON.stringify(hydrated)
    }
  }, [loaded])

  // Local backup — cheap, runs on every keystroke. Skipped until an
  // existing quote has finished hydrating, so the pre-hydration empty
  // state never overwrites that quote's real local backup.
  useEffect(() => {
    if (existingQuoteId && !hydratedRef.current) return
    const key = storageKey(quoteId ?? 'new')
    localStorage.setItem(key, JSON.stringify(state))
  }, [state, quoteId, existingQuoteId])

  const isDirty = JSON.stringify(state) !== lastSavedRef.current

  useEffect(() => {
    function handleBeforeUnload(e) {
      if (isDirty) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const performSave = useCallback(
    async (nextStatus) => {
      if (!organizationId || !state.customerId) return null
      const totals = calculateQuoteTotals({ items: state.items, additionalDiscountPercent: state.additionalDiscountPercent })
      const result = await saveQuote.mutateAsync({
        quote_id: quoteId,
        organization_id: organizationId,
        customer_id: state.customerId,
        status: nextStatus ?? status,
        currency,
        subtotal: Number(totals.subtotal),
        discount_total: Number(totals.lineDiscountTotal) + Number(totals.additionalDiscount),
        tax_total: Number(totals.taxTotal),
        total: Number(totals.total),
        valid_until: state.validUntil || null,
        notes: state.notes || null,
        terms: state.terms || null,
        items: state.items.map((item, index) => ({
          catalog_item_id: item.catalog_item_id,
          name: item.name,
          description: item.description || null,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          discount_percent: item.discount_percent,
          tax_percent: item.tax_percent,
          line_total: Number(calculateQuoteTotals({ items: [item] }).total),
          sort_order: index,
        })),
      })

      lastSavedRef.current = JSON.stringify(state)
      localStorage.removeItem(storageKey(quoteId ?? 'new'))

      if (!quoteId && result) {
        setQuoteId(result.id)
        navigate(`/quotes/${result.id}/edit`, { replace: true })
      }
      if (nextStatus) setStatus(nextStatus)
      return result
    },
    [organizationId, state, quoteId, status, currency, saveQuote, navigate]
  )

  // Debounced autosave while still a draft.
  useEffect(() => {
    if (status !== 'DRAFT') return
    if (!isDirty) return
    if (!state.customerId || state.items.length === 0) return

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setAutosaveState('saving')
      try {
        await performSave()
        setAutosaveState('saved')
      } catch {
        setAutosaveState('error')
      }
    }, 2000)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, status])

  return {
    state,
    setState,
    quoteId,
    status,
    autosaveState,
    isDirty,
    performSave,
    saving: saveQuote.isPending,
  }
}
