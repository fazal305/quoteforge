import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useInvoices(opts = {}) {
  const { search = '', status = 'ALL' } = opts
  return useQuery({
    queryKey: ['invoices', search, status],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select('*, customer:customers(id, name, company)')
        .order('created_at', { ascending: false })

      if (status !== 'ALL') query = query.eq('status', status)
      if (search.trim()) query = query.ilike('invoice_number', `%${search}%`)

      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}

export function useInvoice(id) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const [{ data: invoice, error: invoiceError }, { data: items, error: itemsError }, { data: payments, error: paymentsError }] =
        await Promise.all([
          supabase.from('invoices').select('*, customer:customers(id, name, company, email)').eq('id', id).single(),
          supabase.from('invoice_items').select('*').eq('invoice_id', id).order('sort_order'),
          supabase.from('payments').select('*').eq('invoice_id', id).order('paid_at', { ascending: false }),
        ])
      if (invoiceError) throw invoiceError
      if (itemsError) throw itemsError
      if (paymentsError) throw paymentsError
      return { invoice, items, payments }
    },
    enabled: !!id,
  })
}

export function useQuoteInvoice(quoteId) {
  return useQuery({
    queryKey: ['quote-invoice', quoteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('id, invoice_number')
        .eq('quote_id', quoteId)
        .maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!quoteId,
  })
}

export function useConvertQuoteToInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ quoteId, dueDate }) => {
      const { data, error } = await supabase.rpc('convert_quote_to_invoice', {
        p_quote_id: quoteId,
        p_due_date: dueDate || null,
      })
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      queryClient.invalidateQueries({ queryKey: ['quote', data.quote_id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useRecordPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ invoiceId, amount, paidAt, method, reference, notes }) => {
      const { data, error } = await supabase.rpc('record_payment', {
        p_invoice_id: invoiceId,
        p_amount: amount,
        p_paid_at: paidAt,
        p_method: method || null,
        p_reference: reference || null,
        p_notes: notes || null,
      })
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoice', data.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
