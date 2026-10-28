import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Scroll to hash targets after client-side navigations (e.g. /#pricing). */
export function useHashScroll() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) return

    const id = hash.replace('#', '')
    const frame = window.requestAnimationFrame(() => {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })

    return () => window.cancelAnimationFrame(frame)
  }, [pathname, hash])
}
