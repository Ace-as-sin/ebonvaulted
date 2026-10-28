import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BlogCard } from '../components/BlogCard'
import { BlogHero } from '../components/BlogHero'
import { getPrimaryPost, getSecondaryPosts } from '../content/blog'
import { analytics } from '../lib/analytics'

export function Blog() {
  const primary = getPrimaryPost()
  const secondary = getSecondaryPosts()

  useEffect(() => {
    analytics.pageView('/blog')
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="border-b border-line">
      <BlogHero post={primary} />

      <section
        className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
        aria-label="More privacy briefs"
      >
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
          More they do not put on the box
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Real reporting, then the part that matters: what it means for your
          data, and how Ebon Vaults is being built to refuse that model.
        </p>

        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
          {secondary.map((post) => (
            <li key={post.slug}>
              <BlogCard post={post} />
            </li>
          ))}
        </ul>

        <div className="mt-14 rounded-2xl border border-line bg-charcoal-800/40 px-6 py-8 text-center sm:px-10">
          <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">
            Prefer storage that stays storage?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted">
            Ebon Vaults will not monetize, train on, give away, or use customer
            information. Join the waitlist.
          </p>
          <Link
            to="/#waitlist"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 px-6 py-3 text-sm font-semibold text-navy-950 shadow-lg shadow-teal-500/20 transition hover:brightness-110"
            onClick={() =>
              analytics.track('cta_click', {
                id: 'join_waitlist',
                location: 'blog_index',
              })
            }
          >
            Join the Waitlist
          </Link>
        </div>
      </section>
    </div>
  )
}
