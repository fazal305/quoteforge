import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useGenerateQuoteSuggestion() {
  return useMutation({
    mutationFn: async ({ prompt, currency }) => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('You must be signed in to use the AI Quote Assistant.')
      }

      const res = await fetch('/api/ai-quote-assistant', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ prompt, currency }),
      })
      const body = await res.json()
      if (!res.ok) {
        throw new Error(body.error || 'The AI assistant is unavailable right now.')
      }
      return body.items
    },
  })
}
