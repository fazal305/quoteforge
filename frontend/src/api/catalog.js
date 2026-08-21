import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useCatalogItems(search = '') {
  return useQuery({
    queryKey: ['catalog', search],
    queryFn: async () => {
      let query = supabase.from('catalog_items').select('*').order('created_at', { ascending: false })
      if (search.trim()) {
        query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`)
      }
      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}

export function useCreateCatalogItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input) => {
      const { data, error } = await supabase.from('catalog_items').insert(input).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['catalog'] }),
  })
}

export function useUpdateCatalogItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data, error } = await supabase.from('catalog_items').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['catalog'] }),
  })
}

export function useDeleteCatalogItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('catalog_items').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['catalog'] }),
  })
}
