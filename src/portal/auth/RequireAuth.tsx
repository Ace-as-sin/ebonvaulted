import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'

/**
 * Client-side route guard only. The storage API must still enforce auth.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div
        className="flex min-h-[50vh] items-center justify-center bg-navy-950 text-muted"
        aria-busy="true"
        aria-label="Checking session"
      >
        <p className="text-sm">Checking your session…</p>
      </div>
    )
  }

  if (status !== 'authenticated') {
    return (
      <Navigate to="/app/signin" replace state={{ from: location.pathname }} />
    )
  }

  return children
}
