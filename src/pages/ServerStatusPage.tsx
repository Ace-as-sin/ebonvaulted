import {
  CheckCircle2,
  Loader2,
  Lock,
  RefreshCw,
  Server,
  ShieldAlert,
  XCircle,
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import {
  checkWaitlistHealth,
  checkWaitlistLive,
  dryRunWaitlistSignup,
  getWaitlistEndpointForStatus,
  getWaitlistHealthEndpoint,
  getWaitlistLiveEndpoint,
  type WaitlistDryRunResult,
  type WaitlistHealthResult,
  type WaitlistLiveResult,
} from '../lib/waitlistStatus'

type UnlockState = 'locked' | 'unlocked'
type CheckPhase = 'idle' | 'running' | 'done'

export function ServerStatusPage() {
  const formId = useId()
  const [live, setLive] = useState<WaitlistLiveResult | null>(null)
  const [livePhase, setLivePhase] = useState<CheckPhase>('idle')
  const [lastLiveCheckedAt, setLastLiveCheckedAt] = useState<string | null>(
    null,
  )

  const [token, setToken] = useState('')
  const [unlockError, setUnlockError] = useState('')
  const [unlockState, setUnlockState] = useState<UnlockState>('locked')
  const [detailPhase, setDetailPhase] = useState<CheckPhase>('idle')
  const [health, setHealth] = useState<WaitlistHealthResult | null>(null)
  const [dryRun, setDryRun] = useState<WaitlistDryRunResult | null>(null)

  const liveConfigured = Boolean(getWaitlistLiveEndpoint())
  const healthConfigured = Boolean(getWaitlistHealthEndpoint())
  const waitlistConfigured = Boolean(getWaitlistEndpointForStatus())
  const inFlightRef = useRef(false)

  const runLiveCheck = useCallback(async () => {
    if (inFlightRef.current) return
    inFlightRef.current = true
    setLivePhase('running')
    try {
      const result = await checkWaitlistLive()
      setLive(result)
      setLastLiveCheckedAt(new Date().toISOString())
      setLivePhase('done')
    } finally {
      inFlightRef.current = false
    }
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    void runLiveCheck()
  }, [runLiveCheck])

  const runDetailedChecks = async (accessKey: string) => {
    setDetailPhase('running')
    setHealth(null)
    setDryRun(null)

    const healthResult = await checkWaitlistHealth(accessKey)
    setHealth(healthResult)
    const dryRunResult = await dryRunWaitlistSignup(accessKey)
    setDryRun(dryRunResult)
    setDetailPhase('done')
  }

  const handleUnlock = async (event: FormEvent) => {
    event.preventDefault()
    const trimmed = token.trim()
    if (!trimmed) {
      setUnlockError('Enter your waitlist status access key.')
      return
    }
    if (!healthConfigured && !waitlistConfigured) {
      setUnlockError(
        'Detailed check endpoints are not configured. Set VITE_WAITLIST_HEALTH_ENDPOINT and VITE_WAITLIST_ENDPOINT, then rebuild the site.',
      )
      return
    }

    setUnlockError('')
    setUnlockState('unlocked')
    await runDetailedChecks(trimmed)
  }

  const handleLock = () => {
    setToken('')
    setUnlockState('locked')
    setDetailPhase('idle')
    setHealth(null)
    setDryRun(null)
    setUnlockError('')
  }

  return (
    <div className="border-b border-line bg-navy-950">
      <section
        className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
        aria-labelledby="server-status-heading"
      >
        <div className="rounded-3xl border border-line bg-charcoal-800/60 shadow-2xl shadow-navy-950/40">
          <div className="border-b border-line bg-gradient-to-r from-teal-500/10 via-transparent to-blue-500/10 px-6 py-8 sm:px-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-400">
              Server status
            </p>
            <h1
              id="server-status-heading"
              className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
            >
              Waitlist API monitor
            </h1>
            <p className="mt-3 text-base text-muted">
              Unlisted page. Checks API liveness when this page loads — no
              access key required for up/down.
            </p>
          </div>

          <div className="space-y-8 px-6 py-8 sm:px-10 sm:py-10">
            <dl className="grid gap-3 sm:grid-cols-2">
              <ConfigChip
                label="Live endpoint"
                ok={liveConfigured}
                value={
                  liveConfigured
                    ? 'Configured'
                    : 'Missing live URL (set LIVE or HEALTH …/health)'
                }
              />
              <ConfigChip
                label="Check timing"
                ok
                value="On page load"
              />
            </dl>

            <div className="rounded-2xl border border-line bg-navy-950/40 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-ink">
                  <Server className="h-5 w-5 text-blue-400" aria-hidden="true" />
                  <h2 className="font-display text-lg font-semibold">
                    API liveness
                  </h2>
                </div>
                <button
                  type="button"
                  disabled={livePhase === 'running'}
                  onClick={() => void runLiveCheck()}
                  className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-white/5 px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-teal-400/40 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {livePhase === 'running' ? (
                    <>
                      <Loader2
                        className="h-3.5 w-3.5 animate-spin"
                        aria-hidden="true"
                      />
                      Checking…
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                      Check now
                    </>
                  )}
                </button>
              </div>

              {livePhase === 'running' && !live && (
                <p className="mt-3 text-sm text-muted">Checking API…</p>
              )}

              {live?.ok && (
                <div className="mt-3 flex items-start gap-2">
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-teal-400"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-medium text-teal-400">
                      API is up
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-muted">
                      <li>Latency: {live.latencyMs} ms</li>
                      {lastLiveCheckedAt && (
                        <li>
                          Checked at:{' '}
                          {new Date(lastLiveCheckedAt).toLocaleString()}
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {live && !live.ok && (
                <div className="mt-3 flex items-start gap-2" role="alert">
                  <XCircle
                    className="mt-0.5 h-5 w-5 shrink-0 text-red-400"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-medium text-red-400">
                      API appears down
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {live.error ?? 'Live check failed.'}
                    </p>
                    {lastLiveCheckedAt && (
                      <p className="mt-2 text-xs text-subtle">
                        Last check:{' '}
                        {new Date(lastLiveCheckedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-line bg-navy-950/50 px-4 py-3 text-sm text-muted">
              <p className="flex items-start gap-2">
                <Lock
                  className="mt-0.5 h-4 w-4 shrink-0 text-teal-400"
                  aria-hidden="true"
                />
                <span>
                  Optional: unlock with your status token for signup counts and
                  a dry-run signup test. The key is never embedded in the site
                  build.
                </span>
              </p>
            </div>

            {unlockState === 'locked' ? (
              <form onSubmit={(e) => void handleUnlock(e)} className="space-y-4">
                <div>
                  <label
                    htmlFor={`${formId}-token`}
                    className="block text-sm font-medium text-ink"
                  >
                    Status access key (optional detailed checks)
                  </label>
                  <input
                    id={`${formId}-token`}
                    name="token"
                    type="password"
                    autoComplete="off"
                    spellCheck={false}
                    value={token}
                    onChange={(e) => {
                      setToken(e.target.value)
                      if (unlockError) setUnlockError('')
                    }}
                    className="mt-2 w-full rounded-xl border border-line bg-navy-950/60 px-4 py-3 text-sm text-ink placeholder:text-subtle transition focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20"
                    placeholder="Paste WAITLIST_STATUS_TOKEN"
                  />
                </div>

                {unlockError && (
                  <p className="text-sm text-red-400" role="alert">
                    {unlockError}
                  </p>
                )}

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line-strong bg-white/5 px-6 py-3 text-sm font-semibold text-ink transition hover:border-teal-400/40 sm:w-auto"
                >
                  Unlock detailed checks
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={detailPhase === 'running'}
                    onClick={() => void runDetailedChecks(token)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 px-5 py-2.5 text-sm font-semibold text-navy-950 shadow-lg shadow-teal-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {detailPhase === 'running' ? (
                      <>
                        <Loader2
                          className="h-4 w-4 animate-spin"
                          aria-hidden="true"
                        />
                        Checking…
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" aria-hidden="true" />
                        Re-run detailed checks
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleLock}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-line-strong bg-white/5 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-teal-400/40"
                  >
                    Lock detailed checks
                  </button>
                </div>

                <div className="grid gap-4">
                  <ResultCard
                    title="Server health (authenticated)"
                    icon={<Server className="h-5 w-5" aria-hidden="true" />}
                    loading={detailPhase === 'running' && !health}
                    result={health}
                    details={
                      health?.ok && health.data ? (
                        <ul className="mt-3 space-y-1 text-sm text-muted">
                          <li>Latency: {health.latencyMs} ms</li>
                          <li>
                            Uptime:{' '}
                            {formatUptime(health.data.uptimeSec ?? 0)}
                          </li>
                          <li>
                            Signups stored: {health.data.signupCount ?? 0}
                          </li>
                          <li>
                            Last signup:{' '}
                            {health.data.lastSignupAt
                              ? new Date(
                                  health.data.lastSignupAt,
                                ).toLocaleString()
                              : 'None yet'}
                          </li>
                        </ul>
                      ) : null
                    }
                  />

                  <ResultCard
                    title="Signup path (dry-run)"
                    icon={
                      <ShieldAlert className="h-5 w-5" aria-hidden="true" />
                    }
                    loading={detailPhase === 'running' && !dryRun}
                    result={dryRun}
                    details={
                      dryRun?.ok ? (
                        <ul className="mt-3 space-y-1 text-sm text-muted">
                          <li>Latency: {dryRun.latencyMs} ms</li>
                          <li>
                            Validated payload:{' '}
                            {dryRun.validated ? 'Yes' : 'Unconfirmed'}
                          </li>
                          <li>
                            Data directory writable:{' '}
                            {dryRun.writable ? 'Yes' : 'Unconfirmed'}
                          </li>
                          <li>No email was persisted.</li>
                        </ul>
                      ) : null
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function ConfigChip({
  label,
  ok,
  value,
}: {
  label: string
  ok: boolean
  value: string
}) {
  return (
    <div className="rounded-xl border border-line bg-navy-950/40 px-4 py-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-subtle">
        {label}
      </dt>
      <dd
        className={`mt-1 text-sm font-medium ${
          ok ? 'text-teal-400' : 'text-amber-200'
        }`}
      >
        {value}
      </dd>
    </div>
  )
}

function ResultCard({
  title,
  icon,
  loading,
  result,
  details,
}: {
  title: string
  icon: ReactNode
  loading: boolean
  result: { ok: boolean; error?: string; code?: string } | null
  details: ReactNode
}) {
  const status = loading
    ? 'loading'
    : result
      ? result.ok
        ? 'ok'
        : 'fail'
      : 'idle'

  return (
    <div className="rounded-2xl border border-line bg-navy-950/40 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-ink">
          <span className="text-blue-400">{icon}</span>
          <h2 className="font-display text-lg font-semibold">{title}</h2>
        </div>
        {status === 'loading' && (
          <Loader2
            className="h-5 w-5 animate-spin text-subtle"
            aria-label="Loading"
          />
        )}
        {status === 'ok' && (
          <CheckCircle2
            className="h-5 w-5 text-teal-400"
            aria-label="Passed"
          />
        )}
        {status === 'fail' && (
          <XCircle className="h-5 w-5 text-red-400" aria-label="Failed" />
        )}
      </div>

      {status === 'ok' && (
        <p className="mt-2 text-sm font-medium text-teal-400">Passed</p>
      )}
      {status === 'fail' && (
        <p className="mt-2 text-sm font-medium text-red-400" role="alert">
          {result?.error ?? 'Check failed.'}
          {result?.code ? (
            <span className="mt-1 block text-xs text-subtle">
              Code: {result.code}
            </span>
          ) : null}
        </p>
      )}
      {details}
    </div>
  )
}

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  if (mins < 60) return `${mins}m ${seconds % 60}s`
  const hours = Math.floor(mins / 60)
  const remMins = mins % 60
  if (hours < 48) return `${hours}h ${remMins}m`
  const days = Math.floor(hours / 24)
  return `${days}d ${hours % 24}h`
}
