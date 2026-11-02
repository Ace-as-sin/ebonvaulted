import type { SecurityTopic } from '../../content/security'

export function TopicCard({ topic }: { topic: SecurityTopic }) {
  return (
    <article className="rounded-2xl border border-line bg-charcoal-800/40 p-5 sm:p-6">
      <h3 className="font-display text-lg font-semibold text-ink">
        {topic.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-muted">{topic.body}</p>
      {topic.bullets && topic.bullets.length > 0 && (
        <ul className="mt-4 space-y-2">
          {topic.bullets.map((item) => (
            <li
              key={item}
              className="flex gap-2.5 text-sm leading-relaxed text-muted"
            >
              <span
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400"
                aria-hidden="true"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
      {topic.limitations && (
        <p className="mt-4 rounded-xl border border-line bg-navy-950/50 px-3.5 py-3 text-sm leading-relaxed text-subtle">
          {topic.limitations}
        </p>
      )}
    </article>
  )
}
