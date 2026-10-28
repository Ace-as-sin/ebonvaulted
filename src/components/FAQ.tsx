import { ChevronDown } from 'lucide-react'
import { useId, useState } from 'react'

interface FaqItem {
  question: string
  answer: string
}

const FAQS: FaqItem[] = [
  {
    question: 'When will Ebon Vaults launch?',
    answer:
      'Ebon Vaults is in prelaunch. We have not purchased or deployed production servers yet. Timing depends on infrastructure setup, security design, and demand from this waitlist. Waitlist members will hear from us as milestones approach — we will not invent a launch date before we can stand behind it.',
  },
  {
    question: 'How will Ebon Vaults protect my files?',
    answer:
      'Protecting stored files is a core design goal. Encryption and access controls are planned as foundational parts of the product. Specific mechanisms, key management details, and verification status will be documented as those systems are designed and tested. We will not claim guarantees we have not yet implemented.',
  },
  {
    question: 'Will Ebon Vaults use my files to train AI?',
    answer:
      'No. Customer files will not be used to train AI models. That commitment is part of why Ebon Vaults is being built.',
  },
  {
    question: 'Where will my files be stored?',
    answer:
      'Ebon Vaults intends to store customer data on independently operated physical server infrastructure rather than relying on third-party cloud storage providers. Exact locations and operational details will be published before launch once infrastructure decisions are finalized.',
  },
  {
    question: 'Can I access my files from my phone?',
    answer:
      'Secure browser and mobile access are planned. They are not available yet because the storage platform itself has not launched. Interest in mobile access helps us prioritize the roadmap.',
  },
  {
    question: 'What happens if I lose access to my account?',
    answer:
      'Account recovery processes have not been finalized. We will design recovery carefully and explain the tradeoffs before launch. Until then, we cannot promise a specific recovery method or guarantee restoration in every scenario.',
  },
  {
    question: 'Is joining the waitlist free?',
    answer:
      'Yes. Joining the waitlist is free and does not require payment information. Selecting a plan only indicates your preferred option for market validation. Pricing remains preliminary and may change before launch.',
  },
]

function FaqAccordionItem({
  item,
  open,
  onToggle,
}: {
  item: FaqItem
  open: boolean
  onToggle: () => void
}) {
  const panelId = useId()
  const buttonId = useId()

  return (
    <div className="border-b border-line last:border-b-0">
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 py-5 text-left text-base font-medium text-ink transition hover:text-teal-400"
        >
          <span>{item.question}</span>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-subtle transition-transform duration-200 ${
              open ? 'rotate-180 text-teal-400' : ''
            }`}
            aria-hidden="true"
          />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        className={open ? 'pb-5' : undefined}
      >
        <p className="pr-8 text-sm leading-relaxed text-muted">{item.answer}</p>
      </div>
    </div>
  )
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section
      id="faq"
      className="scroll-mt-20 border-t border-line py-20 sm:py-24"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-400">
            FAQ
          </p>
          <h2
            id="faq-heading"
            className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
          >
            Straight answers for a product still being built
          </h2>
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-line bg-charcoal-800/40 px-5 sm:px-8">
          {FAQS.map((item, index) => (
            <FaqAccordionItem
              key={item.question}
              item={item}
              open={openIndex === index}
              onToggle={() =>
                setOpenIndex((current) => (current === index ? null : index))
              }
            />
          ))}
        </div>
      </div>
    </section>
  )
}
