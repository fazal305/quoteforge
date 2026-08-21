import { useMutation } from '@tanstack/react-query'

export function useGenerateQuoteSuggestion() {
  return useMutation({
    mutationFn: async ({ prompt, currency }) => {
      const res = await fetch('/api/ai-quote-assistant', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
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
