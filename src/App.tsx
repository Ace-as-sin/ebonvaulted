import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { useHashScroll } from './hooks/useHashScroll'
import { Home } from './pages/Home'

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

function RouteFallback() {
  return (
    <div
      className="min-h-[40vh] bg-navy-950"
      aria-busy="true"
      aria-label="Loading page"
    />
  )
}

function AppRoutes() {
  useHashScroll()

  return (
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
