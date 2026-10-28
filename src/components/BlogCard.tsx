import { ArrowRight, Clock, Newspaper } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  formatPostDate,
  formatSourcesLabel,
  getPostPath,
  type BlogPost,
} from '../content/blog'

interface BlogCardProps {
  post: BlogPost
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link
      to={getPostPath(post.slug)}
      className="group flex h-full flex-col rounded-2xl border border-line bg-charcoal-800/40 p-6 transition duration-300 hover:border-teal-400/30 hover:bg-charcoal-800/70 focus-visible:outline-offset-4 sm:p-8"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium uppercase tracking-wide">
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

      <h2 className="mt-4 font-display text-xl font-semibold tracking-tight text-ink transition group-hover:text-teal-400">
        {post.title}
      </h2>

      <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-subtle">
        <Newspaper className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate">{formatSourcesLabel(post)}</span>
      </p>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
        {post.excerpt}
      </p>

      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-400 transition group-hover:text-teal-300">
        Read brief
        <ArrowRight
          className="h-4 w-4 transition group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
    </Link>
  )
}
