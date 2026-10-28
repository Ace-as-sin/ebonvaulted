import { ChevronDown } from 'lucide-react'
import { useId, useState } from 'react'
import { Reveal } from './Reveal'

interface FaqItem {
  question: string
  /** Opening line shown with emphasis */
  lead: string
  paragraphs: string[]
  /** Closing line shown with emphasis */
  closing?: string
  /** Italic disclaimer / planned-architecture note */
  note?: string
  /** Extra visual weight for core privacy commitments */
  highlight?: boolean
}

const FAQS: FaqItem[] = [
  {
    question: 'Will Ebon Vault ever sell or share my data?',
    lead: 'We will never sell your data. Period.',
    highlight: true,
    paragraphs: [
      'Your files are yours. Ebon Vault will not sell customer files or personal information, provide customer content to advertisers, or voluntarily share your files with data brokers or AI companies.',
      'There are limited circumstances where disclosure may be legally required, such as a valid court order, warrant, or other compulsory legal process.',
      'When we receive a government request, our policy will be to verify its legal validity, challenge requests that are improper or overly broad where appropriate, and disclose only information we are legally required to provide.',
      'Where legally permitted, we intend to notify affected customers before disclosing their information.',
      'We will not promise to ignore lawful orders or guarantee that every customer can be notified.',
    ],
  },
  {
    question: 'How does Ebon Vault protect my files?',
    lead: 'Security starts before your files reach our servers.',
    paragraphs: [
      'Ebon Vault is being designed around encrypted file transfers, protected storage, and independently operated server infrastructure.',
      'Files will travel over encrypted HTTPS connections, protecting them against interception during transmission.',
      'Our planned security architecture includes encryption at rest, strict access controls, isolated customer storage, and monitoring for unauthorized activity.',
      'Unlike services that depend on third-party cloud storage platforms, our goal is to maintain direct control over the physical infrastructure holding customer files.',
      'Independent infrastructure reduces certain third-party dependencies, but it does not automatically eliminate security risks. We believe security requires careful engineering, continuous maintenance, and transparency.',
      'These capabilities are planned for launch and will be documented and verified before customers are invited to store files.',
    ],
  },
  {
    question: 'What protections does Ebon Vaults provide for my stored data?',
    lead: 'Your data. Your encryption key. Your control.',
    highlight: true,
    paragraphs: [
      'Ebon Vaults is designed to protect customer files through encryption that places control of decryption keys in the hands of the customer.',
      'With customer-controlled, end-to-end encryption, files are encrypted before leaving your device and remain encrypted while stored on Ebon Vaults infrastructure. Ebon Vaults does not possess the decryption keys necessary to access the contents of these protected files.',
      'This protection also applies to lawful government requests. If Ebon Vaults receives a legally valid demand for customer information, we will comply with applicable law. However, where customer-controlled encryption is used and Ebon Vaults does not possess the necessary decryption keys, we cannot independently decrypt the protected file contents.',
      'Ebon Vaults may still be legally required to disclose encrypted files, account information, metadata, or other information within its possession, custody, or control.',
    ],
    closing:
      'Our commitment is simple: We will protect your privacy through technical safeguards, not merely promises.',
    note: 'This describes our intended customer-controlled encryption architecture. Its protections and limitations will be verified and documented before the service launches.',
  },
  {
    question: 'Can Ebon Vault employees see my files?',
    lead: 'Our goal is to minimize access, not simply promise restraint.',
    paragraphs: [
      'We are designing Ebon Vault to limit access to customer information through encryption, technical controls, and clearly defined authorization procedures.',
      'Our intended approach is to prevent routine administrative access to customer file contents.',
      'The exact level of protection depends on the final encryption and account-recovery architecture. We will clearly explain whether Ebon Vault can technically decrypt stored files before launch.',
      'We will never claim that employees cannot access encrypted content unless the system has been designed and verified to make that true.',
    ],
  },
  {
    question: 'Will my files ever be used to train AI?',
    lead: 'No. Your files are not training material.',
    paragraphs: [
      'Ebon Vault will not use customer files, photos, documents, or other stored content to train artificial intelligence models.',
      'We will not license customer content to AI developers or sell customer files to data aggregators.',
      'Our business model is based on customers paying for storage, not on monetizing what they store.',
      'This is a core business commitment, not an optional privacy setting.',
    ],
  },
  {
    question: 'What happens if the government requests my data?',
    lead: 'We respect lawful process, but we do not provide unrestricted access.',
    paragraphs: [
      'Ebon Vault will not voluntarily provide government agencies with unrestricted access to customer accounts.',
      'If we receive legally binding demands for information, we will review their validity and scope, seek legal advice when appropriate, and disclose only what applicable law requires.',
      'Where permitted, we will notify affected customers.',
      'Encryption can limit what information we are technically capable of providing, depending on how the final encryption architecture is implemented.',
      'We will be transparent about these limitations and will not claim that customer data is immune from lawful legal process.',
    ],
  },
  {
    question: 'What happens if Ebon Vault experiences a cyberattack?',
    lead: 'We design for security, but we also prepare for failure.',
    paragraphs: [
      'No connected storage system can honestly guarantee that it will never be attacked or compromised.',
      "Ebon Vault's planned defenses include encryption, restricted administrative access, software updates, security monitoring, and isolation between customer storage areas.",
      'If a security incident occurs, our policy will be to investigate promptly, contain the incident, restore secure operations, and notify affected customers when required by law or our published commitments.',
      'We believe customers deserve clear communication when their information may be at risk.',
    ],
  },
  {
    question: 'What happens if a server fails or is destroyed?',
    lead: 'Protecting data means planning for hardware failure.',
    paragraphs: [
      'Ebon Vault plans to use redundant storage to protect against certain individual drive failures.',
      'However, redundancy is not the same as an independent backup. Events such as fire, flooding, theft, or catastrophic hardware failure can still result in data loss.',
      'We will clearly document our storage redundancy, recovery procedures, and limitations before launch.',
      'We will never advertise guaranteed data survival or disaster recovery capabilities that have not been implemented and tested.',
    ],
  },
  {
    question: 'Who actually owns my data?',
    lead: 'You do. Always.',
    paragraphs: [
      'Uploading files to Ebon Vault does not transfer ownership of your content to our company.',
      'You retain your rights to your files.',
      'Ebon Vault receives only the limited permissions necessary to store, maintain, retrieve, and share your files according to your instructions and our service agreement.',
      'We will not claim ownership of customer content or use broad licensing language to justify unrelated commercial exploitation.',
    ],
  },
  {
    question: 'What happens to my files if I cancel my subscription?',
    lead: 'Your data should never be held hostage.',
    paragraphs: [
      'Our intended policy is to provide customers with a reasonable opportunity to retrieve their files before account closure.',
      'We will publish clear retention, grace-period, deletion, and billing policies before launch.',
      'Once deletion is completed, files will no longer be accessible through the service. The exact handling of redundant copies, backups, and legally required retention will be explained in our published policy.',
      'We will not intentionally create unnecessary barriers to retrieving your own information.',
    ],
  },
  {
    question: 'Why should I trust a smaller company with my data?',
    lead: 'Trust should be earned through transparency, not company size.',
    paragraphs: [
      'Ebon Vault is being built around a straightforward proposition: customers pay us to protect their information, not to profit from its contents.',
      'We intend to operate independent storage infrastructure, explain our security practices in understandable language, and publish honest limitations.',
      'Being smaller does not automatically make a company more secure. We believe trust comes from sound engineering, accountable operations, clear agreements, and keeping promises.',
      'We want customers to evaluate Ebon Vault based on what we actually implement and demonstrate.',
    ],
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
          className="flex w-full items-center justify-between gap-4 py-5 text-left text-base font-medium text-ink transition hover:text-teal-400 sm:py-6"
        >
          <span>{item.question}</span>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-subtle transition-transform duration-300 ${
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
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 pb-5 pr-2 sm:pr-8 sm:pb-6">
            <p
              className={`text-sm font-semibold leading-relaxed sm:text-base ${
                item.highlight ? 'text-teal-400' : 'text-ink'
              }`}
            >
              {item.lead}
            </p>
            {item.paragraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 48)}
                className="text-sm leading-relaxed text-muted"
              >
                {paragraph}
              </p>
            ))}
            {item.closing && (
              <p
                className={`text-sm font-semibold leading-relaxed sm:text-base ${
                  item.highlight ? 'text-teal-400' : 'text-ink'
                }`}
              >
                {item.closing}
              </p>
            )}
            {item.note && (
              <p className="text-sm italic leading-relaxed text-subtle">
                {item.note}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function FAQ() {
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(() => new Set([0]))

  const toggle = (index: number) => {
    setOpenIndexes((current) => {
      const next = new Set(current)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <section
      id="faq"
      className="scroll-mt-20 border-t border-line py-20 sm:py-24"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-400">
            FAQ
          </p>
          <h2
            id="faq-heading"
            className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
          >
            Your Data. Your Rights. Straight Answers.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Privacy shouldn&apos;t require reading 40 pages of legal agreements.
            Here&apos;s what you deserve to know about how we protect your
            information.
          </p>
        </Reveal>

        <Reveal
          delay={120}
          className="mx-auto mt-12 max-w-3xl rounded-2xl border border-line bg-charcoal-800/40 px-5 sm:px-8"
        >
          {FAQS.map((item, index) => (
            <FaqAccordionItem
              key={item.question}
              item={item}
              open={openIndexes.has(index)}
              onToggle={() => toggle(index)}
            />
          ))}
        </Reveal>
      </div>
    </section>
  )
}
