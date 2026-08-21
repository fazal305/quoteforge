import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 text-center">
      <h1 className="text-lg font-semibold text-neutral-900">Page not found</h1>
      <Link to="/" className="text-sm text-brand-600 hover:underline">
        Back to dashboard
      </Link>
    </div>
  )
}
