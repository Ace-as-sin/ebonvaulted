import { LogOut } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import { Logo } from '../../components/Logo'
import { useAuth } from '../auth/AuthProvider'
import { isStorageMockMode } from '../api/config'

export function PortalShell() {
  const { user, status, signOut, mockMode } = useAuth()
  const showMock = mockMode || isStorageMockMode()

  return (
    <div className="flex min-h-svh flex-col bg-navy-950 text-ink">
      <a
        href="#portal-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-teal-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-navy-950"
      >
        Skip to content
      </a>
      <header className="border-b border-line bg-navy-950/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/app" className="rounded-md focus-visible:outline-offset-4">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            {showMock && (
              <span className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-200">
                Mock mode
              </span>
            )}
            {status === 'authenticated' && user && (
              <>
                <span className="hidden max-w-[14rem] truncate text-sm text-muted sm:inline">
                  {user.email}
                </span>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-muted transition-colors hover:border-line-strong hover:text-ink"
                >
                  <LogOut className="h-4 w-4" aria-hidden />
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      <main id="portal-main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
      <footer className="border-t border-line py-4 text-center text-xs text-subtle">
        Ebon Vaults space storage · Files stay encrypted on your device before upload
      </footer>
    </div>
  )
}
