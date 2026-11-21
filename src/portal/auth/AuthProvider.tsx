import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getSession, signOut as apiSignOut } from '../api/auth'
import { setUnauthorizedHandler } from '../api/client'
import { isStorageMockMode } from '../api/config'
import { clearAllFileKeys } from '../crypto/keyStore'
import type { AuthUser } from '../api/types'
import { StorageApiError } from '../api/types'

type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

interface AuthContextValue {
  status: AuthStatus
  user: AuthUser | null
  error: string | null
  mockMode: boolean
  refresh: () => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<AuthUser | null>(null)
  const [error, setError] = useState<string | null>(null)
  const mockMode = isStorageMockMode()

  const refresh = useCallback(async () => {
    setError(null)
    try {
      const session = await getSession()
      if (session.user && session.session) {
        setUser(session.user)
        setStatus('authenticated')
      } else {
        setUser(null)
        setStatus('anonymous')
      }
    } catch (err) {
      setUser(null)
      setStatus('anonymous')
      if (err instanceof StorageApiError) {
        setError(err.message)
      } else {
        setError('Could not verify your session.')
      }
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await apiSignOut()
    } catch {
      // Still clear local UI state even if the network call fails.
    }
    clearAllFileKeys()
    setUser(null)
    setStatus('anonymous')
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAllFileKeys()
      setUser(null)
      setStatus('anonymous')
      setError('Your session has expired. Please sign in again.')
    })
    return () => setUnauthorizedHandler(null)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      error,
      mockMode,
      refresh,
      signOut,
      clearError: () => setError(null),
    }),
    [status, user, error, mockMode, refresh, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
