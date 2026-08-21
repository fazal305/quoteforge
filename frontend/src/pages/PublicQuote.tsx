import { useParams } from 'react-router-dom'

/**
 * Public, unauthenticated quote view: /quote/:token
 * Token is an opaque secure random string from quote_public_tokens —
 * never the quote's database ID. Implemented in Phase 3.
 */
export function PublicQuote() {
  const { token } = useParams<{ token: string }>()

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <p className="text-sm text-neutral-500">
        Public quote view for token <code className="rounded bg-neutral-100 px-1.5 py-0.5">{token}</code> is
        implemented in Phase 3 (customer approval workflow).
      </p>
    </div>
  )
}
