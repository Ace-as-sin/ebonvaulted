import { Search, X } from 'lucide-react'
import { useEffect, useId, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BlogCard } from '../components/BlogCard'
import { BlogHero } from '../components/BlogHero'
import {
  getPrimaryPost,
  getSecondaryPosts,
  searchPosts,
} from '../content/blog'
import { analytics } from '../lib/analytics'

export function Blog() {
  const primary = getPrimaryPost()
  const listedPosts = getSecondaryPosts()
  const [query, setQuery] = useState('')
  const searchId = useId()

  const normalizedQuery = query.trim()
  const isSearching = normalizedQuery.length > 0

  const results = useMemo(
    () => searchPosts(normalizedQuery),
    [normalizedQuery],
  )

  useEffect(() => {
    analytics.pageView('/blog')
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="border-b border-line">
      {!isSearching && <BlogHero post={primary} />}

      <section
        className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
        aria-label={isSearching ? 'Search results' : 'More privacy briefs'}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
              {isSearching
                ? 'Search results'
                : 'More they do not put on the box'}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {isSearching
                ? `Showing briefs matching “${normalizedQuery}”.`
                : 'Real reporting, then the part that matters: what it means for your data, and how Ebon Vaults is being built to refuse that model.'}
            </p>
          </div>

          <div className="relative w-full sm:max-w-sm">
            <label htmlFor={searchId} className="sr-only">
              Search privacy briefs
            </label>
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
              aria-hidden="true"
            />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search briefs…"
              autoComplete="off"
              className="w-full rounded-xl border border-line bg-charcoal-800/60 py-2.5 pl-10 pr-10 text-sm text-ink placeholder:text-subtle outline-none transition focus:border-teal-400/40 focus:ring-2 focus:ring-teal-400/20"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-subtle transition hover:bg-charcoal-700 hover:text-ink"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {isSearching ? (
          results.length > 0 ? (
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
              {results.map((post) => (
                <li key={post.slug}>
                  <BlogCard post={post} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-10 rounded-2xl border border-dashed border-line px-6 py-10 text-center text-sm text-muted">
              No briefs matched “{normalizedQuery}”. Try a different word —
              privacy, AI, cameras, breach, or ownership.
            </p>
          )
        ) : (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
            {listedPosts.map((post) => (
              <li key={post.slug}>
                <BlogCard post={post} />
              </li>
            ))}
          </ul>
        )}

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
