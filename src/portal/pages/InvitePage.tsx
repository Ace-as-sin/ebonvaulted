import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  beginPasskeyRegistration,
  redeemInvitation,
} from '../api/auth'
import { useAuth } from '../auth/AuthProvider'

export function InvitePage() {
  const { mockMode } = useAuth()
  const [token, setToken] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setMessage(null)
    try {
      const redeem = await redeemInvitation(token.trim())
      if (redeem.status === 'not_ready') {
        setMessage(
          'Invitation redemption is not live on the storage API yet. The UI is ready for the backend contract.',
        )
        return
      }
      const enroll = await beginPasskeyRegistration()
      if (enroll.status === 'not_ready') {
        setMessage(
          'Passkey enrollment is not live yet. After invitations ship, you will register a passkey here.',
        )
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-line bg-navy-900/50 p-6 sm:p-8">
        <h1 className="font-display text-2xl font-semibold">
          Redeem invitation
        </h1>
        <p className="mt-2 text-sm text-muted">
          Enter the invitation code from Ebon Vaults, then register a passkey.
          No passwords.
        </p>

        {mockMode && (
          <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
            Mock mode: redemption endpoints are stubs.
          </p>
        )}

        <form className="mt-6 space-y-4" onSubmit={(e) => void onSubmit(e)}>
          <div>
            <label htmlFor="invite-token" className="text-sm text-muted">
              Invitation code
            </label>
            <input
              id="invite-token"
              name="token"
              autoComplete="off"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line bg-navy-950 px-3 py-2.5 text-sm text-ink outline-none focus:border-teal-500"
              required
            />
          </div>
          <button
            type="submit"
            className="btn-cta w-full rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-60"
            disabled={busy || !token.trim()}
          >
            {busy ? 'Working…' : 'Continue'}
          </button>
        </form>

        {message && (
          <p className="mt-4 rounded-lg border border-line bg-navy-950/50 px-3 py-2 text-sm text-muted">
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-subtle">
          Already enrolled?{' '}
          <Link to="/app/signin" className="text-teal-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
