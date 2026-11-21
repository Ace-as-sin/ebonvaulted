import { Fingerprint, KeyRound } from 'lucide-react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { beginPasskeySignIn } from '../api/auth'
import { useAuth } from '../auth/AuthProvider'
import { useState } from 'react'

export function SignInPage() {
  const { status, mockMode, error, clearError, refresh } = useAuth()
  const location = useLocation()
  const from =
    (location.state as { from?: string } | null)?.from &&
    (location.state as { from: string }).from.startsWith('/app')
      ? (location.state as { from: string }).from
      : '/app'

  const [busy, setBusy] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  if (status === 'authenticated') {
    return <Navigate to={from} replace />
  }

  const tryPasskey = async () => {
    clearError()
    setLocalError(null)
    setBusy(true)
    try {
      if (mockMode) {
        await refresh()
        return
      }
      const result = await beginPasskeySignIn()
      if (result.status === 'not_ready') {
        setLocalError(
          'Passkey sign-in is not connected to the storage API yet. Use mock mode in local development, or wait for backend enrollment to go live.',
        )
      }
    } catch {
      setLocalError('Sign-in failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-line bg-navy-900/50 p-6 sm:p-8">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-muted">
          Access your private space storage with a passkey. Password login is
          not used.
        </p>

        {(error || localError) && (
          <p
            className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200"
            role="alert"
          >
            {localError ?? error}
          </p>
        )}

        {mockMode && (
          <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
            Local mock mode is on. Continue opens a preview session — no real
            passkey ceremony runs.
          </p>
        )}

        <button
          type="button"
          className="btn-cta mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-60"
          disabled={busy || status === 'loading'}
          onClick={() => void tryPasskey()}
        >
          <Fingerprint className="h-4 w-4" aria-hidden />
          {mockMode ? 'Continue with preview session' : 'Sign in with passkey'}
        </button>

        <p className="mt-6 text-center text-sm text-subtle">
          Have an invitation?{' '}
          <Link to="/app/invite" className="text-teal-400 hover:underline">
            Redeem invite
          </Link>
        </p>
      </div>

      <p className="mt-6 flex items-start gap-2 text-xs text-subtle">
        <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        Route protection in this app is for UX only. The storage API must
        enforce every request.
      </p>
    </div>
  )
}
