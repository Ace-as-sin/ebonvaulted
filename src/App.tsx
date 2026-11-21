import { lazy, Suspense, useEffect } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { Layout } from './components/Layout'
import { TrackingConsentBanner } from './components/TrackingConsentBanner'
import { useHashScroll } from './hooks/useHashScroll'
import {
  bindMetaConsentListener,
  initMetaPixel,
  trackPageView,
} from './lib/metaPixel'
import { Home } from './pages/Home'
import { AuthProvider } from './portal/auth/AuthProvider'
import { RequireAuth } from './portal/auth/RequireAuth'
import { PortalShell } from './portal/components/PortalShell'

const PricingCalculatorPage = lazy(() =>
  import('./pages/PricingCalculatorPage').then((m) => ({
    default: m.PricingCalculatorPage,
  })),
)
const SecurityPage = lazy(() =>
  import('./pages/SecurityPage').then((m) => ({ default: m.SecurityPage })),
)
const ServerStatusPage = lazy(() =>
  import('./pages/ServerStatusPage').then((m) => ({
    default: m.ServerStatusPage,
  })),
)
const Blog = lazy(() =>
  import('./pages/Blog').then((m) => ({ default: m.Blog })),
)
const BlogPost = lazy(() =>
  import('./pages/BlogPost').then((m) => ({ default: m.BlogPost })),
)
const PrivacyPolicy = lazy(() =>
  import('./pages/PrivacyPolicy').then((m) => ({ default: m.PrivacyPolicy })),
)
const Terms = lazy(() =>
  import('./pages/Terms').then((m) => ({ default: m.Terms })),
)
const SignInPage = lazy(() =>
  import('./portal/pages/SignInPage').then((m) => ({ default: m.SignInPage })),
)
const InvitePage = lazy(() =>
  import('./portal/pages/InvitePage').then((m) => ({ default: m.InvitePage })),
)
const DashboardPage = lazy(() =>
  import('./portal/pages/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  })),
)

function RouteFallback() {
  return (
    <div
      className="min-h-[40vh] bg-navy-950"
      aria-busy="true"
      aria-label="Loading page"
    />
  )
}

function isPortalPath(pathname: string) {
  return pathname === '/app' || pathname.startsWith('/app/')
}

function MetaPixelRouteTracker() {
  const location = useLocation()

  useEffect(() => {
    if (isPortalPath(location.pathname)) return
    initMetaPixel()
    return bindMetaConsentListener()
  }, [location.pathname])

  useEffect(() => {
    if (isPortalPath(location.pathname)) return
    trackPageView(location.pathname + location.search)
  }, [location.pathname, location.search])

  return null
}

function AppRoutes() {
  useHashScroll()
  const location = useLocation()
  const onPortal = isPortalPath(location.pathname)

  return (
    <>
      <MetaPixelRouteTracker />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route
              path="pricing-calculator"
              element={<PricingCalculatorPage />}
            />
            <Route path="security" element={<SecurityPage />} />
            <Route path="server-status" element={<ServerStatusPage />} />
            <Route
              path="status"
              element={<Navigate to="/server-status" replace />}
            />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:slug" element={<BlogPost />} />
            <Route path="privacy" element={<PrivacyPolicy />} />
            <Route path="terms" element={<Terms />} />
          </Route>

          <Route
            path="app"
            element={
              <AuthProvider>
                <PortalShell />
              </AuthProvider>
            }
          >
            <Route
              index
              element={
                <RequireAuth>
                  <DashboardPage />
                </RequireAuth>
              }
            />
            <Route path="signin" element={<SignInPage />} />
            <Route path="invite" element={<InvitePage />} />
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      {!onPortal && <TrackingConsentBanner />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
