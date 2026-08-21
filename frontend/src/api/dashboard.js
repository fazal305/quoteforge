import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

const PIPELINE_STATUSES = ['SENT', 'VIEWED']
const OUTSTANDING_INVOICE_STATUSES = ['ISSUED', 'PARTIALLY_PAID']

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const [{ data, error }, { data: invoiceData, error: invoiceError }] = await Promise.all([
        supabase
          .from('quotes')
          .select('*, customer:customers(id, name, company)')
          .order('created_at', { ascending: false })
          .limit(200),
        supabase.from('invoices').select('id, status, total, due_date').limit(500),
      ])

      if (error) throw error
      if (invoiceError) throw invoiceError
      const quotes = data

      const now = Date.now()
      const outstandingInvoices = invoiceData.filter((inv) => OUTSTANDING_INVOICE_STATUSES.includes(inv.status))
      const outstandingTotal = outstandingInvoices.reduce((sum, inv) => sum + Number(inv.total), 0)
      const overdueCount = outstandingInvoices.filter((inv) => inv.due_date && new Date(inv.due_date).getTime() < now).length
      const paidTotal = invoiceData.filter((inv) => inv.status === 'PAID').reduce((sum, inv) => sum + Number(inv.total), 0)

      const countsByStatus = quotes.reduce((acc, q) => {
        acc[q.status] = (acc[q.status] ?? 0) + 1
        return acc
      }, {})

      const pipelineTotal = quotes
        .filter((q) => PIPELINE_STATUSES.includes(q.status))
        .reduce((sum, q) => sum + Number(q.total), 0)

      const needsAttention = quotes.filter((q) => {
        if (q.status === 'CHANGE_REQUESTED') return true
        if ((q.status === 'SENT' || q.status === 'VIEWED') && q.valid_until) {
          return new Date(q.valid_until).getTime() < now
        }
        return false
      })

      return {
        countsByStatus,
        pipelineTotal,
        recentQuotes: quotes.slice(0, 8),
        needsAttention,
        outstandingTotal,
        overdueCount,
        paidTotal,
      }
    },
  })
}
