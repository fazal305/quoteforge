import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { generateSecureToken } from '@/lib/token'

export function useQuotes(opts = {}) {
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
      return data
    },
  })
}

export function useQuote(id) {
  return useQuery({
    queryKey: ['quote', id],
    queryFn: async () => {
      const [{ data: quote, error: quoteError }, { data: items, error: itemsError }] = await Promise.all([
        supabase.from('quotes').select('*, customer:customers(id, name, company, email)').eq('id', id).single(),
        supabase.from('quote_items').select('*').eq('quote_id', id).order('sort_order'),
      ])
      if (quoteError) throw quoteError
      if (itemsError) throw itemsError
      return { quote, items }
    },
    enabled: !!id,
  })
}

export function useQuoteEvents(quoteId) {
  return useQuery({
    queryKey: ['quote-events', quoteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quote_events')
        .select('*')
        .eq('quote_id', quoteId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
    enabled: !!quoteId,
  })
}

export function useSaveQuote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input) => {
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
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      queryClient.invalidateQueries({ queryKey: ['quote', data.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useQuotePublicToken(quoteId) {
  return useQuery({
    queryKey: ['quote-public-token', quoteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quote_public_tokens')
        .select('*')
        .eq('quote_id', quoteId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!quoteId,
  })
}

// Get-or-create: reuses an existing, non-expired token for the quote
// instead of minting a new one every time the quote is (re)sent, so a
// previously shared link keeps working.
export function useEnsurePublicToken() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (quoteId) => {
      const { data: existing, error: fetchError } = await supabase
        .from('quote_public_tokens')
        .select('*')
        .eq('quote_id', quoteId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (fetchError) throw fetchError
      if (existing && (!existing.expires_at || new Date(existing.expires_at) > new Date())) {
        return existing
      }

      const { data: created, error: insertError } = await supabase
        .from('quote_public_tokens')
        .insert({ quote_id: quoteId, token: generateSecureToken() })
        .select()
        .single()
      if (insertError) throw insertError
      return created
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quote-public-token', data.quote_id] })
    },
  })
}

export function useTransitionQuoteStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params) => {
      const { data, error } = await supabase.rpc('transition_quote_status', {
        p_quote_id: params.quoteId,
        p_new_status: params.newStatus,
        p_actor_type: params.actorType,
        p_actor_label: params.actorLabel,
        p_message: params.message,
        p_event_type: params.eventType,
      })
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      queryClient.invalidateQueries({ queryKey: ['quote', data.id] })
      queryClient.invalidateQueries({ queryKey: ['quote-events', data.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
