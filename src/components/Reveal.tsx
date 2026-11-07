import type { CSSProperties, ElementType, ReactNode } from 'react'
import { useReveal } from '../hooks/useReveal'

interface RevealProps {
  children: ReactNode
  className?: string
  /** Delay after the element enters view (ms). */
  delay?: number
  /** `up` matches the hero fade-up; `fade` is opacity-only. */
  variant?: 'up' | 'fade'
  as?: ElementType
}

export function Reveal({
  children,
  className = '',
  delay = 0,
  variant = 'up',
  as: Tag = 'div',
}: RevealProps) {
  const { ref, visible } = useReveal<HTMLElement>()

  const style: CSSProperties | undefined =
    delay > 0 ? { transitionDelay: `${delay}ms` } : undefined

  const motionClass = variant === 'fade' ? 'reveal-fade' : 'reveal'

  return (
    <Tag
      ref={ref}
      className={`${motionClass} ${visible ? 'reveal-visible' : ''} ${className}`.trim()}
      style={style}
    >
      {children}
    </Tag>
  )
}
