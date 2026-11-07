import { useEffect, useRef, useState } from 'react'

interface UseRevealOptions {
  /** Fraction of element that must be visible (0–1). */
  threshold?: number
  /** Extra root margin — negative bottom waits until content is further in view. */
  rootMargin?: string
}

/**
 * One-shot scroll reveal. Returns a ref and whether the element has entered view.
 * Honors prefers-reduced-motion by revealing immediately.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.12,
  rootMargin = '0px 0px -48px 0px',
}: UseRevealOptions = {}) {
  const ref = useRef<T | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || visible) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [visible, threshold, rootMargin])

  return { ref, visible }
}
