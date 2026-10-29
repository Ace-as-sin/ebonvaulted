import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { analytics } from '../lib/analytics'
import { Logo } from './Logo'

const NAV_LINKS = [
  { href: '/#pricing', label: 'Pricing', id: 'pricing' },
  { href: '/#waitlist', label: 'Waitlist', id: 'waitlist' },
  { href: '/#features', label: 'Features', id: 'features' },
  { href: '/#about', label: 'About', id: 'about' },
  { href: '/blog', label: 'Blog', id: 'blog' },
  { href: '/#faq', label: 'FAQ', id: 'faq' },
] as const

export function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Close mobile menu when the route changes (browser back/forward, etc.)
  const routeKey = `${location.pathname}${location.hash}`
  const [menuRoute, setMenuRoute] = useState(routeKey)
  if (menuRoute !== routeKey) {
    setMenuRoute(routeKey)
    if (open) setOpen(false)
  }

  const handleNav = (target: string) => {
    analytics.track('nav_click', { target })
    setOpen(false)
  }

  const goHomeTop = () => {
    handleNav('logo')
    if (location.pathname !== '/' || location.hash) {
      navigate('/')
      window.setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 0)
      return
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? 'border-b border-line bg-navy-950/90 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Primary"
      >
        <Link
          to="/"
          className="rounded-md focus-visible:outline-offset-4"
          onClick={(event) => {
            event.preventDefault()
            goHomeTop()
          }}
        >
          <Logo />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.id}>
              {link.href.startsWith('/#') ? (
                <a
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-white/5 hover:text-ink"
                  onClick={() => handleNav(link.id)}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  to={link.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white/5 hover:text-ink ${
                    location.pathname.startsWith(link.href)
                      ? 'text-ink'
                      : 'text-muted'
                  }`}
                  onClick={() => handleNav(link.id)}
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="hidden md:block">
          <a
            href="/#waitlist"
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 px-4 py-2 text-sm font-semibold text-navy-950 shadow-lg shadow-teal-500/20 transition hover:brightness-110"
            onClick={() => {
              handleNav('waitlist')
              analytics.track('cta_click', {
                id: 'join_waitlist',
                location: 'header',
              })
            }}
          >
            Join Waitlist
          </a>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-ink hover:bg-white/5 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <div
        id="mobile-nav"
        className={`border-t border-line bg-navy-950 md:hidden ${
          open ? 'block' : 'hidden'
        }`}
      >
        <ul className="flex flex-col gap-1 px-4 py-4">
          {NAV_LINKS.map((link) => (
            <li key={link.id}>
              {link.href.startsWith('/#') ? (
                <a
                  href={link.href}
                  className="block rounded-lg px-3 py-3 text-base font-medium text-muted hover:bg-white/5 hover:text-ink"
                  onClick={() => handleNav(link.id)}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  to={link.href}
                  className="block rounded-lg px-3 py-3 text-base font-medium text-muted hover:bg-white/5 hover:text-ink"
                  onClick={() => handleNav(link.id)}
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
          <li className="pt-2">
            <a
              href="/#waitlist"
              className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 px-4 py-3 text-sm font-semibold text-navy-950"
              onClick={() => {
                handleNav('waitlist')
                analytics.track('cta_click', {
                  id: 'join_waitlist',
                  location: 'header_mobile',
                })
              }}
            >
              Join Waitlist
            </a>
          </li>
        </ul>
      </div>
    </header>
  )
}
