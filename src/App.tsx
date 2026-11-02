import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { useHashScroll } from './hooks/useHashScroll'
import { Blog } from './pages/Blog'
import { BlogPost } from './pages/BlogPost'
import { Home } from './pages/Home'
import { PricingCalculatorPage } from './pages/PricingCalculatorPage'
import { PrivacyPolicy } from './pages/PrivacyPolicy'
import { ServerStatusPage } from './pages/ServerStatusPage'
import { Terms } from './pages/Terms'

function AppRoutes() {
  useHashScroll()

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="pricing-calculator" element={<PricingCalculatorPage />} />
        <Route path="server-status" element={<ServerStatusPage />} />
        <Route path="status" element={<Navigate to="/server-status" replace />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogPost />} />
        <Route path="privacy" element={<PrivacyPolicy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
