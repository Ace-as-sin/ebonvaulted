import { ArrowRight, Clock, Newspaper } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  formatPostDate,
  formatSourcesLabel,
  getPostPath,
  type BlogPost,
} from '../content/blog'

interface BlogHeroProps {
  post: BlogPost
}

export function BlogHero({ post }: BlogHeroProps) {
  const asidePull = post.whyItMatters[0]
  const asideNote = post.whyItMatters[1] ?? post.excerpt

  return (
    <Link
      to={getPostPath(post.slug)}
      className="group relative block overflow-hidden border-b border-line bg-radial-glow focus-visible:outline-offset-[-4px]"
    >
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-14 lg:px-8 lg:py-24">
        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium uppercase tracking-wide">
            <span className="rounded-full bg-red-500/15 px-2.5 py-1 text-red-300 ring-1 ring-red-400/30">
              Primary story
            </span>
            <span className="rounded-full bg-teal-500/10 px-2.5 py-1 text-teal-400 ring-1 ring-teal-400/20">
              {post.category}
            </span>
            <time className="text-subtle" dateTime={post.publishedAt}>
              {formatPostDate(post.publishedAt)}
            </time>
            <span className="inline-flex items-center gap-1 text-subtle">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {post.readMinutes} min read
            </span>
          </div>

          <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold tracking-tight text-ink transition group-hover:text-teal-400 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
            {post.title}
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            {post.excerpt}
          </p>

          <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-subtle">
            <Newspaper className="h-4 w-4 shrink-0" aria-hidden="true" />
            {formatSourcesLabel(post)}
          </p>

          <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-teal-400 transition group-hover:text-teal-300">
            Read brief
            <ArrowRight
              className="h-4 w-4 transition group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </div>

        <div
          className="relative hidden min-h-[220px] overflow-hidden rounded-2xl border border-line bg-navy-900/50 p-6 backdrop-blur-sm lg:block"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-wider text-red-300">
              Why this leads
            </p>
            {asidePull && (
              <p className="mt-4 font-display text-2xl font-semibold leading-snug text-ink">
                {asidePull}
              </p>
            )}
            <p className="mt-4 text-sm leading-relaxed text-muted">{asideNote}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}
