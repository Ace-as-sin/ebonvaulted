import { Link } from 'react-router-dom'
import { Logo } from './Logo'

const COPYRIGHT_YEAR = 2026

export function Footer() {
  return (
    <footer className="border-t border-line bg-navy-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div>
          <Logo showIcon={false} />
          <p className="mt-3 max-w-xs text-sm text-muted">
            Independently built. Privacy focused.
          </p>
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted">
            <li>
              <Link to="/blog" className="transition hover:text-ink">
                Blog
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="transition hover:text-ink">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="transition hover:text-ink">
                Terms
              </Link>
            </li>
            <li>
              <a href="/#waitlist" className="transition hover:text-ink">
                Contact
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {COPYRIGHT_YEAR} Ebon Vaults. All rights reserved.</p>
          <p>Prelaunch · Not a live storage service yet</p>
        </div>
      </div>
    </footer>
  )
}
