import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Clock,
  Link2,
  Newspaper,
  Shield,
  Sparkles,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  formatPostDate,
  formatSourcesLabel,
  getAllPosts,
  getPostBySlug,
  getPostPath,
} from '../content/blog'
import { analytics } from '../lib/analytics'

function ParagraphList({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="space-y-4">
      {paragraphs.map((paragraph) => (
        <p key={paragraph.slice(0, 64)} className="text-base leading-relaxed text-muted">
          {paragraph}
        </p>
      ))}
    </div>
  )
}

export function BlogPost() {
  const { slug = '' } = useParams()
  const post = getPostBySlug(slug)
  const related = getAllPosts()
    .filter((p) => p.slug !== slug)
    .slice(0, 3)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!post) return
    analytics.pageView(getPostPath(post.slug))
    window.scrollTo(0, 0)
  }, [post])

  if (!post) {
    return <Navigate to="/blog" replace />
  }

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${getPostPath(post.slug)}`
      : getPostPath(post.slug)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <article className="border-b border-line">
      <header className="relative overflow-hidden border-b border-line bg-radial-glow">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-25" />
        <div className="relative mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <p className="text-sm text-teal-400">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to blog
            </Link>
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium uppercase tracking-wide">
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

          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
            {post.title}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
            {post.excerpt}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void copyLink()}
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-white/5 px-4 py-2.5 text-sm font-medium text-ink transition hover:border-teal-400/40 hover:bg-white/8"
            >
              {copied ? (
                <Check className="h-4 w-4 text-teal-400" aria-hidden="true" />
              ) : (
                <Link2 className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? 'Link copied' : 'Copy link to this brief'}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="space-y-12">
          <section aria-labelledby="what-happened-heading">
            <h2
              id="what-happened-heading"
              className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl"
            >
              What was reported
            </h2>
            <div className="mt-4">
              <ParagraphList paragraphs={post.whatHappened} />
            </div>
          </section>

          <section
            aria-labelledby="why-it-matters-heading"
            className="rounded-2xl border border-line bg-charcoal-800/40 p-6 sm:p-8"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2
                id="why-it-matters-heading"
                className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl"
              >
                Why it matters for your data
              </h2>
            </div>
            <div className="mt-5">
              <ParagraphList paragraphs={post.whyItMatters} />
            </div>
          </section>

          <section
            aria-labelledby="how-ebon-protects-heading"
            className="rounded-2xl border border-teal-400/25 bg-teal-500/5 p-6 sm:p-8"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-400/10 text-teal-400 ring-1 ring-teal-400/25">
                <Shield className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2
                id="how-ebon-protects-heading"
                className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl"
              >
                How Ebon Vaults protects against that
              </h2>
            </div>
            <div className="mt-5">
              <ParagraphList paragraphs={post.howEbonVaultsProtects} />
            </div>
          </section>
        </div>

        <aside className="mt-14 rounded-2xl border border-teal-400/20 bg-gradient-to-r from-teal-500/10 via-transparent to-blue-500/10 px-6 py-6 sm:px-8">
          <h2 className="font-display text-lg font-semibold text-ink">
            Want storage that stays storage?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Ebon Vaults will not monetize, train on, give away, or use customer
            information. Join the early-access waitlist.
          </p>
          <Link
            to="/#waitlist"
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 px-5 py-2.5 text-sm font-semibold text-navy-950 transition hover:brightness-110"
            onClick={() =>
              analytics.track('cta_click', {
                id: 'join_waitlist',
                location: 'blog_post',
              })
            }
          >
            Join the Waitlist
          </Link>
        </aside>

        <section
          className="mt-14 rounded-2xl border border-line bg-charcoal-800/50 p-5 sm:p-6"
          aria-labelledby="sources-heading"
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-400/20">
              <Newspaper className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2
              id="sources-heading"
              className="font-display text-lg font-semibold text-ink"
            >
              Source{post.sources.length > 1 ? 's' : ''}
            </h2>
          </div>

          <ul className="mt-5 space-y-4">
            {post.sources.map((source) => (
              <li
                key={source.url}
                className="rounded-xl border border-line bg-navy-950/40 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
                  {source.outlet}
                </p>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-start gap-2 font-display text-base font-semibold text-ink transition hover:text-teal-400"
                >
                  <span>{source.headline}</span>
                  <ArrowUpRight
                    className="mt-1 h-4 w-4 shrink-0 text-teal-400"
                    aria-hidden="true"
                  />
                </a>
                {source.publishedAt && (
                  <p className="mt-1.5 text-xs text-subtle">
                    Published {formatPostDate(source.publishedAt)}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>

        {related.length > 0 && (
          <section className="mt-16" aria-labelledby="related-heading">
            <h2
              id="related-heading"
              className="font-display text-xl font-semibold text-ink"
            >
              More briefs
            </h2>
            <ul className="mt-6 space-y-4">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    to={getPostPath(item.slug)}
                    className="block rounded-xl border border-line bg-charcoal-800/40 px-5 py-4 transition hover:border-teal-400/30 hover:bg-charcoal-800/70"
                  >
                    <span className="text-xs font-medium uppercase tracking-wide text-teal-400">
                      {formatSourcesLabel(item)} · {item.category}
                    </span>
                    <span className="mt-1 block font-display text-base font-semibold text-ink">
                      {item.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  )
}
