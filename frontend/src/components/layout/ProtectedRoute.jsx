import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

export function ProtectedRoute() {
  const status = useAuthStore((s) => s.status)
  const sessionExpired = useAuthStore((s) => s.sessionExpired)

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-neutral-500">
        Loading…
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={sessionExpired ? { sessionExpired: true } : undefined} />
  }

  return <Outlet />
}
