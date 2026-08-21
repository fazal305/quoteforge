import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { QuoteStatusDb, QuoteWithCustomer } from '@/types/database'

export interface DashboardData {
  countsByStatus: Record<QuoteStatusDb, number>
  pipelineTotal: number
  recentQuotes: QuoteWithCustomer[]
  needsAttention: QuoteWithCustomer[]
}

const PIPELINE_STATUSES: QuoteStatusDb[] = ['SENT', 'VIEWED']

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async (): Promise<DashboardData> => {
      const { data, error } = await supabase
        .from('quotes')
        .select('*, customer:customers(id, name, company)')
        .order('created_at', { ascending: false })
        .limit(200)

      if (error) throw error
      const quotes = data as unknown as QuoteWithCustomer[]

      const countsByStatus = quotes.reduce(
        (acc, q) => {
          acc[q.status] = (acc[q.status] ?? 0) + 1
          return acc
        },
        {} as Record<QuoteStatusDb, number>
      )

      const pipelineTotal = quotes
        .filter((q) => PIPELINE_STATUSES.includes(q.status))
        .reduce((sum, q) => sum + Number(q.total), 0)

      const now = Date.now()
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
      }
    },
  })
}
