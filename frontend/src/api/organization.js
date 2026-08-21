import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'

async function fetchProfile(authUserId) {
  const { data: userRow, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', authUserId)
    .single()

  if (userError) throw userError

  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', userRow.organization_id)
    .single()

  if (orgError) throw orgError

  return { user: userRow, organization: org }
}

export function useProfile() {
  const authUserId = useAuthStore((s) => s.user?.id)

  return useQuery({
    queryKey: ['profile', authUserId],
    queryFn: () => fetchProfile(authUserId),
    enabled: !!authUserId,
    staleTime: 60_000,
  })
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
