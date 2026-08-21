import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { QuoteEventRow, QuoteItemRow, QuoteRow, QuoteStatusDb, QuoteWithCustomer } from '@/types/database'

export function useQuotes(opts: { search?: string; status?: QuoteStatusDb | 'ALL' } = {}) {
  const { search = '', status = 'ALL' } = opts
  return useQuery({
    queryKey: ['quotes', search, status],
    queryFn: async () => {
      let query = supabase
        .from('quotes')
        .select('*, customer:customers(id, name, company)')
        .order('created_at', { ascending: false })

      if (status !== 'ALL') query = query.eq('status', status)
      if (search.trim()) query = query.ilike('quote_number', `%${search}%`)

      const { data, error } = await query
      if (error) throw error
      return data as unknown as QuoteWithCustomer[]
    },
  })
}

export function useQuote(id: string | undefined) {
  return useQuery({
    queryKey: ['quote', id],
    queryFn: async () => {
      const [{ data: quote, error: quoteError }, { data: items, error: itemsError }] = await Promise.all([
        supabase.from('quotes').select('*, customer:customers(id, name, company, email)').eq('id', id).single(),
        supabase.from('quote_items').select('*').eq('quote_id', id).order('sort_order'),
      ])
      if (quoteError) throw quoteError
      if (itemsError) throw itemsError
      return { quote: quote as unknown as QuoteWithCustomer, items: items as QuoteItemRow[] }
    },
    enabled: !!id,
  })
}

export function useQuoteEvents(quoteId: string | undefined) {
  return useQuery({
    queryKey: ['quote-events', quoteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quote_events')
        .select('*')
        .eq('quote_id', quoteId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as QuoteEventRow[]
    },
    enabled: !!quoteId,
  })
}

export interface SaveQuoteItemInput {
  catalog_item_id: string | null
  name: string
  description: string | null
  quantity: number
  unit: string
  unit_price: number
  discount_percent: number
  tax_percent: number
  line_total: number
  sort_order: number
}

export interface SaveQuoteInput {
  quote_id: string | null
  organization_id: string
  customer_id: string
  status: QuoteStatusDb
  currency: string
  subtotal: number
  discount_total: number
  tax_total: number
  total: number
  valid_until: string | null
  notes: string | null
  terms: string | null
  items: SaveQuoteItemInput[]
}

export function useSaveQuote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: SaveQuoteInput) => {
      const { data, error } = await supabase.rpc('save_quote', {
        p_quote_id: input.quote_id,
        p_organization_id: input.organization_id,
        p_customer_id: input.customer_id,
        p_status: input.status,
        p_currency: input.currency,
        p_subtotal: input.subtotal,
        p_discount_total: input.discount_total,
        p_tax_total: input.tax_total,
        p_total: input.total,
        p_valid_until: input.valid_until,
        p_notes: input.notes,
        p_terms: input.terms,
        p_items: input.items,
      })
      if (error) throw error
      return data as QuoteRow
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      queryClient.invalidateQueries({ queryKey: ['quote', data.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useTransitionQuoteStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: {
      quoteId: string
      newStatus: QuoteStatusDb
      actorType: 'USER' | 'CUSTOMER' | 'SYSTEM'
      actorLabel: string
      message: string
      eventType: string
    }) => {
      const { data, error } = await supabase.rpc('transition_quote_status', {
        p_quote_id: params.quoteId,
        p_new_status: params.newStatus,
        p_actor_type: params.actorType,
        p_actor_label: params.actorLabel,
        p_message: params.message,
        p_event_type: params.eventType,
      })
      if (error) throw error
      return data as QuoteRow
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      queryClient.invalidateQueries({ queryKey: ['quote', data.id] })
      queryClient.invalidateQueries({ queryKey: ['quote-events', data.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
