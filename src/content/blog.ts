/**
 * Ebon Vaults blog — news brief / article format
 * ==============================================
 * Standard briefs use:
 *   1. whatHappened
 *   2. whyItMatters
 *   3. howEbonVaultsProtects
 *
 * Longer pieces may instead supply `sections` (custom headings + paragraphs).
 * Sources render at the bottom of the page.
 *
 * Set primary: true on ONE post — it becomes the hero on /blog.
 * Shareable URL: /blog/<slug>
 */

export type BlogCategory =
  | 'AI & privacy'
  | 'Device surveillance'
  | 'Web tracking'
  | 'Data breaches'
  | 'Data Privacy'
  | 'Company principles'

/** External news / research article this brief cites. */
export interface NewsSource {
  outlet: string
  headline: string
  url: string
  publishedAt?: string
}

export interface BlogSection {
  id: string
  heading: string
  paragraphs: string[]
}

export interface BlogPostInput {
  slug: string
  title: string
  excerpt: string
  category: BlogCategory
  publishedAt: string
  /** Source articles shown at the bottom of the post */
  sources: NewsSource[]
  /** Standard brief fields — required unless `sections` is provided */
  whatHappened?: string[]
  whyItMatters?: string[]
  howEbonVaultsProtects?: string[]
  /** Optional long-form article body with custom section headings */
  sections?: BlogSection[]
  /** Marks the hero story on /blog — only one should be true */
  primary?: boolean
  readMinutes?: number
  /** Optional meta description for document title / SEO helpers */
  seoDescription?: string
  /** Shown near the top of the article when present */
  editorNote?: string
  /** Optional CTA after the article body */
  securityCta?: boolean
  /** Right-rail copy on the /blog hero for primary stories */
  heroLead?: string
  heroSupport?: string
}

export interface BlogPost extends Omit<BlogPostInput, 'sources'> {
  sources: NewsSource[]
  readMinutes: number
  whatHappened: string[]
  whyItMatters: string[]
  howEbonVaultsProtects: string[]
}

const MAX_SOURCES = 6

function estimateReadMinutes(post: BlogPostInput): number {
  const sectionWords =
    post.sections?.flatMap((section) => section.paragraphs) ?? []
  const words = [
    post.excerpt,
    ...(post.whatHappened ?? []),
    ...(post.whyItMatters ?? []),
    ...(post.howEbonVaultsProtects ?? []),
    ...sectionWords,
  ]
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length

  return Math.max(2, Math.ceil(words / 200))
}

export function definePost(input: BlogPostInput): BlogPost {
  if (input.sources.length < 1) {
    throw new Error(`Blog post "${input.slug}" needs at least one source.`)
  }

  const hasSections = Boolean(input.sections?.length)
  const hasBrief =
    Boolean(input.whatHappened?.length) &&
    Boolean(input.whyItMatters?.length) &&
    Boolean(input.howEbonVaultsProtects?.length)

  if (!hasSections && !hasBrief) {
    throw new Error(
      `Blog post "${input.slug}" needs either sections or the standard brief fields.`,
    )
  }

  return {
    ...input,
    whatHappened: input.whatHappened ?? [],
    whyItMatters: input.whyItMatters ?? [],
    howEbonVaultsProtects: input.howEbonVaultsProtects ?? [],
    sources: input.sources.slice(0, MAX_SOURCES),
    readMinutes: input.readMinutes ?? estimateReadMinutes(input),
  }
}

export function getPrimarySource(post: BlogPost): NewsSource {
  return post.sources[0]!
}

export function formatSourcesLabel(post: BlogPost): string {
  const first = getPrimarySource(post)
  if (post.sources.length === 1) return `Via ${first.outlet}`
  return `Via ${first.outlet} +${post.sources.length - 1} more`
}

/**
 * EDIT HERE — add new briefs at the top of this array.
 * Put primary: true on the most egregious story for the /blog hero.
 * Sources render at the bottom of the article.
 */
export const BLOG_POSTS: BlogPost[] = [
  definePost({
    slug: 'meta-25-billion-privacy-judgment',
    title:
      'Meta Ordered to Pay $25 Billion: When Privacy Promises Become Legal Liabilities',
    excerpt:
      'A landmark New Mexico ruling raises serious questions about data privacy, user consent, and whether technology companies deliver on their promises.',
    category: 'Data Privacy',
    publishedAt: '2026-11-02',
    primary: true,
    readMinutes: 6,
    seoDescription:
      'A New Mexico judge ordered Meta to pay $25 billion after a jury found widespread consumer-protection violations. Here\'s what the ruling means for data privacy.',
    editorNote:
      "Editor's note: This article describes the October 21, 2026 ruling. Meta has stated that it intends to appeal. The judgment and legal proceedings may change.",
    securityCta: true,
    heroLead:
      'A court-ordered $25 billion civil penalty puts privacy promises under a legal microscope — and the appeal fight is still ahead.',
    heroSupport:
      'Jury findings, Cambridge Analytica history, and what consumers should take away about consent, control, and architecture.',
    sources: [
      {
        outlet: 'New Mexico Courts',
        headline:
          'Findings of Fact and Conclusions of Law (Oct. 21, 2026) — D-101-CV-2021-00132',
        url: 'https://nmcourts.gov/wp-content/uploads/2026/10/Findings-and-Conclusions-21-Oct-26-D101CV202100132.pdf',
        publishedAt: '2026-10-21',
      },
      {
        outlet: 'Associated Press',
        headline:
          'Meta ordered to pay $25 billion after New Mexico jury findings on consumer privacy',
        url: 'https://apnews.com/article/b329f82c3d3db3758a159405acbd4d0e',
        publishedAt: '2026-10-21',
      },
      {
        outlet: 'Reuters',
        headline:
          'Meta ordered to pay $25 billion to New Mexico after jury finds company misled consumers about data privacy',
        url: 'https://www.investing.com/news/stock-market-news/meta-ordered-to-pay-25-billion-to-new-mexico-after-jury-finds-company-misled-consumers-about-data-privacy-4963776',
        publishedAt: '2026-10-21',
      },
      {
        outlet: 'Reuters',
        headline:
          'Meta misled consumers in case over Cambridge Analytica scandal, New Mexico jury says',
        url: 'https://www.investing.com/news/stock-market-news/meta-misled-consumers-in-case-over-cambridge-analytica-scandal-new-mexico-jury-says-4917926',
        publishedAt: '2026-09-25',
      },
    ],
    sections: [
      {
        id: 'intro',
        heading: 'A $25 Billion Warning About Data Privacy',
        paragraphs: [
          'On October 21, 2026, a New Mexico court ordered Meta Platforms to pay $25 billion in civil penalties after a jury found widespread consumer-protection violations. The size of the figure grabs headlines. The deeper story is harder — and more useful — for ordinary people: what happens when a company’s public privacy message and its real-world systems no longer line up in the eyes of a court.',
          'Customers often assume that if a platform offers privacy settings, publishes a policy, and talks about control, their information is meaningfully protected. Cases like this one force a different question. Privacy is not only a slogan or a menu of toggles. It is also about what systems are designed to allow, who can access personal information, and whether those practices match what people were told.',
          'This is not a victory lap for any single company competitor, and it is not proof that every technology firm mishandles data. It is a warning about the gap that can open between what customers believe happens with their information and how platforms actually operate.',
        ],
      },
      {
        id: 'what-happened',
        heading: 'What Happened in New Mexico?',
        paragraphs: [
          'The dispute traces back to a 2021 lawsuit. On September 25, 2026, a New Mexico jury found Meta liable for widespread violations of the New Mexico Unfair Practices Act. On October 21, 2026, Judge Francis J. Mathew of New Mexico’s First Judicial District Court ordered $25 billion in civil penalties.',
          'According to the court’s findings, the case identified 43,899,720 violations. The jury found 26 of 29 challenged statements misleading. The litigation centered on allegations about Facebook’s representations concerning privacy, user control over personal information, and certain content-moderation policies.',
          'Meta disputes the judgment and has stated that it intends to appeal. The company has challenged the state’s interpretation of the evidence and the size of the civil penalties. Meta also maintains that it does not sell users’ personal information. Those positions matter: the $25 billion figure is a court-ordered civil penalty, not a completed payment, and not a settlement. Appeals can reduce, reverse, or otherwise change what ultimately happens.',
        ],
      },
      {
        id: 'cambridge-analytica',
        heading: 'How Cambridge Analytica Changed the Privacy Conversation',
        paragraphs: [
          'The New Mexico case sits in the long shadow of Cambridge Analytica. Revelations showed that Cambridge Analytica obtained information associated with as many as 87 million Facebook profiles through a third-party application. That information was used in political profiling and targeted advertising connected with the 2016 U.S. election.',
          'Those events made “who can reach your profile data, and under what rules?” a mainstream concern. In the New Mexico litigation, Facebook’s privacy representations and the broader data-collection environment became central issues. That does not mean every one of those 87 million people was a New Mexico resident, and it does not mean every Facebook user was directly affected by the Cambridge Analytica incident. It does mean that third-party access, consent, and platform promises stopped being abstract policy language for millions of people.',
        ],
      },
      {
        id: 'control',
        heading: 'The Real Issue: Who Actually Controls Your Information?',
        paragraphs: [
          'Privacy marketing often collapses several different ideas into one word. A company can promise privacy in advertising. It can offer privacy settings that change what other users see. It can implement technical restrictions that limit what systems, partners, or employees can access. Or it can invite independent review of its security and privacy claims. Those are not interchangeable.',
          'A settings panel can be helpful and still leave the underlying architecture free to collect, combine, or expose data in ways customers never picture. A privacy policy can describe practices accurately and still leave people with little practical control. Technical design — encryption choices, access boundaries, retention rules, and who holds the keys — is where many of the hardest protections either exist or do not.',
          'The New Mexico findings about misleading statements are a reminder that words matter in consumer protection law. They are also a reminder for individuals: if your trust rests only on a company’s language, you are trusting a promise. Architecture is what makes a promise harder to break.',
        ],
      },
      {
        id: 'value',
        heading: 'Why Personal Data Is So Valuable',
        paragraphs: [
          'Personal information fuels advertising, analytics, behavioral profiling, and product personalization. Those uses are not automatically unlawful. Modern digital services often depend on some amount of data to function. The hard questions are whether people understand what is collected, whether they authorized it, whether disclosures were clear, and whether the company’s conduct matches its statements and the law.',
          'When profile data, social connections, interests, and behavior can be packaged into targeting systems, the economic incentive to stretch “consent” and “control” is obvious. That incentive is exactly why precise language, enforceable consumer-protection rules, and technical limits all matter together — not as substitutes for one another.',
        ],
      },
      {
        id: 'consumers',
        heading: 'What Consumers Can Learn',
        paragraphs: [
          'You do not need to follow every court filing to improve your own posture. Review the privacy permissions attached to apps and accounts you actually use. Limit third-party access you no longer need. Before uploading sensitive documents or personal archives, ask whether that service needs the file at all.',
          'It also helps to separate common security phrases. Encryption in transit protects data while it moves across a network. Encryption at rest protects stored copies on a server’s disk. Customer-controlled encryption goes further by keeping plaintext out of the provider’s reach unless you unlock it. Those layers answer different threats. Marketing that says “encrypted” without saying which layer can sound stronger than the design really is.',
          'Prefer services with understandable privacy policies and security practices you can evaluate — including clear statements about what they will not do with your files.',
        ],
      },
      {
        id: 'ebon-vaults',
        heading: 'The Ebon Vaults Perspective: Privacy by Design',
        paragraphs: [
          'At Ebon Vaults, we believe privacy should be built into the architecture of a service—not left entirely to a settings menu or buried in a lengthy agreement. That\'s why we\'re designing private space storage around customer-controlled encryption, independent infrastructure, and transparent privacy commitments.',
          'Our planned design includes client-side encryption, customer-controlled encryption keys, a commitment not to sell customer data, a commitment not to train AI on customer file contents, independently operated physical storage hardware, plain-English privacy promises, and transparent documentation of security protections and limitations.',
          'Ebon Vaults is still under development. We are not claiming a finished, independently audited encryption product today, and we are not connected to the Meta litigation. The point of telling this story is simpler: when privacy becomes a legal liability for broken promises, architecture-first design is not a branding flourish. It is how you try to keep promises honest.',
        ],
      },
      {
        id: 'conclusion',
        heading: 'Privacy Should Be a Principle, Not a Setting',
        paragraphs: [
          'The New Mexico judgment is large, contested, and unfinished in the sense that Meta intends to appeal. Even so, it sharpens a lesson that does not depend on the final dollar amount: privacy isn\'t just about what a company promises. It\'s about what its systems are designed to protect, what its policies allow, and whether its actions match its words.',
          'If you care about that distinction, look past slogans. Ask who can read your files, who holds the keys, and what the provider refuses to do with your information — then choose storage built around those answers.',
        ],
      },
    ],
  }),

  definePost({
    slug: 'login-walls-steal-your-data',
    title: 'Want to Exist Online? Sign In So We Can Track You.',
    excerpt:
      'It is not just news articles. Webpages, TVs, search — almost everything now demands a login or watches you anyway. Browsing became a checkpoint. Your identity became the toll.',
    category: 'Web tracking',
    publishedAt: '2026-10-28',
    sources: [
      {
        outlet: 'Reuters Institute for the Study of Journalism',
        headline:
          'The Cookiepocalypse: Why first-party data is going to matter to your newsroom',
        url: 'https://reutersinstitute.politics.ox.ac.uk/cookiepocalypse-why-first-party-data-going-matter-your-newsroom',
        publishedAt: '2021-10-28',
      },
      {
        outlet: 'Axios',
        headline: "Scoop: CNN's data push",
        url: 'https://www.axios.com/2024/06/04/scoop-cnn-s-data-push-media-trends',
        publishedAt: '2024-06-04',
      },
      {
        outlet: 'Federal Trade Commission',
        headline: 'Paying for Privacy: Pay-or-Tracking Walls (research paper)',
        url: 'https://www.ftc.gov/system/files/ftc_gov/pdf/muller.tribbensee.pay_.or_.tracking.walls_.pdf',
        publishedAt: '2024-01-01',
      },
    ],
    whatHappened: [
      'Try reading a news site and a registration wall stops you cold — create an account or leave. Publishers have been blunt about why: forced logins collect first-party data so they can recognize you across sessions and devices. The Reuters Institute even notes how powerful brands can slam that gate shut early and still get people to comply.',
      'Then look around. Want to use the TV you already paid for? Sign in. Want apps, recommendations, “smart” features? Sign in. Want to search or browse with the biggest platforms on earth? Congratulations — you are already the product, logged in or not. The pattern is the same everywhere: no identity, no access — or access with invisible surveillance baked in.',
    ],
    whyItMatters: [
      'Casual browsing is dying. Everyday life now runs through checkpoints that demand an email, a Google account, an Apple ID, a Facebook login, a smart-TV profile — anything that turns “a person looking at a screen” into “a named record we can follow.”',
      'Once you are signed in, they can stitch it together: what you read, what you watch, what you search, how long you linger, what you buy next. A free account is not hospitality. It is how they convert your curiosity into a tracked customer file.',
      'And when they do not force a login, they often track you anyway — cookies, pixels, account graphs, device IDs, “personalized” search. Either you hand over your identity at the door, or they build one behind your back. That is not a fair trade for looking at a webpage.',
    ],
    howEbonVaultsProtects: [
      'Ebon Vaults is being built as storage, not a surveillance tollbooth. Your files should not require becoming a marketing profile.',
      'We will not monetize customer information, train on it, give it away, or use it as a secondary product. You should not have to surrender your identity — or get quietly profiled — just to keep what is already yours.',
    ],
  }),

  definePost({
    slug: 'smart-tvs-and-always-listening-devices',
    title: 'Your Devices Hear Everything — Then Keep the Tape',
    excerpt:
      'Parents hit delete. The recordings stayed. Regulators say kids’ living-room audio was kept forever and used to improve the system anyway.',
    category: 'Device surveillance',
    publishedAt: '2026-10-18',
    sources: [
      {
        outlet: 'Federal Trade Commission',
        headline:
          'FTC and DOJ Charge Amazon with Violating Children’s Privacy Law by Keeping Kids’ Alexa Voice Recordings Forever and Undermining Parents’ Deletion Requests',
        url: 'https://www.ftc.gov/news-events/news/press-releases/2023/05/ftc-doj-charge-amazon-violating-childrens-privacy-law-keeping-kids-alexa-voice-recordings-forever',
        publishedAt: '2023-05-31',
      },
      {
        outlet: 'U.S. Department of Justice',
        headline:
          'Amazon Agrees to Injunctive Relief and $25 Million Civil Penalty for Alleged Violations of Children’s Privacy Law Relating to Alexa',
        url: 'https://www.justice.gov/archives/opa/pr/amazon-agrees-injunctive-relief-and-25-million-civil-penalty-alleged-violations-childrens',
        publishedAt: '2023-07-19',
      },
      {
        outlet: 'Federal Trade Commission',
        headline: 'Amazon.com (Alexa), U.S. v. — case page',
        url: 'https://www.ftc.gov/legal-library/browse/cases-proceedings/192-3128-amazoncom-alexa-us-v',
        publishedAt: '2023-07-21',
      },
    ],
    whatHappened: [
      'The FTC and DOJ alleged Amazon kept children’s Alexa voice recordings indefinitely, undermined deletion, and used that intimate audio to help improve its systems — while households thought “delete” meant gone.',
      'That is the nightmare version of “smart” living rooms: microphones in private spaces, recordings on someone else’s servers, and control that turns out to be theater.',
    ],
    whyItMatters: [
      'Your home is not offline anymore. Voice devices can capture conversations, questions, and kids’ speech patterns — then retain them longer than you expect.',
      'Once that audio leaves the room, it can be reused, retained, breached, or fed into product improvement. If deletion is optional for the company, privacy is optional for you.',
    ],
    howEbonVaultsProtects: [
      'Ebon Vaults is not a microphone in your living room. We are building encrypted file storage — not a business that needs to listen to your family.',
      'We will not monetize customer information, train on it, give it away, or use it as a secondary product. If you back up personal media with us, custody means custody.',
    ],
    heroLead:
      'Intimate personal data used in ways customers did not realize — including after they thought they had deleted it.',
    heroSupport:
      'The most egregious example on our radar of “smart” devices turning private life into retained product fuel.',
  }),

  definePost({
    slug: 'your-files-should-not-train-ai',
    title: 'Your Private Files Are Training Someone Else’s AI',
    excerpt:
      'Tech giants are starving for training data. The uncomfortable question: is your cloud archive storage — or raw material?',
    category: 'AI & privacy',
    publishedAt: '2026-10-20',
    sources: [
      {
        outlet: 'The New York Times',
        headline: 'How Tech Giants Cut Corners to Harvest Data for A.I.',
        url: 'https://www.nytimes.com/2024/04/06/technology/tech-giants-harvest-data-artificial-intelligence.html',
        publishedAt: '2024-04-06',
      },
      {
        outlet: 'Federal Trade Commission',
        headline: 'FTC business guidance: Privacy & security',
        url: 'https://www.ftc.gov/business-guidance/privacy-security',
        publishedAt: '2024-01-01',
      },
      {
        outlet: 'Federal Trade Commission',
        headline:
          'FTC and DOJ Charge Amazon with Violating Children’s Privacy Law… (voice data used to improve systems)',
        url: 'https://www.ftc.gov/news-events/news/press-releases/2023/05/ftc-doj-charge-amazon-violating-childrens-privacy-law-keeping-kids-alexa-voice-recordings-forever',
        publishedAt: '2023-05-31',
      },
    ],
    whatHappened: [
      'Major tech companies have been reported racing to vacuum up text, images, and other media to feed AI systems — scraping, licensing, and leaning on product usage in ways most customers never picture when they hit upload.',
      'The same companies that host your digital life also build models that need endless new fuel. That conflict of interest is not theoretical.',
    ],
    whyItMatters: [
      'You uploaded photos and documents to keep them safe — not to donate them as training data. When storage and AI live under one roof, “hosting” can quietly become “using.”',
      'Personal archives are gold for models: journals, scans, drafts, private media. If your vault is inventory, you are not the customer. You are the quarry.',
    ],
    howEbonVaultsProtects: [
      'Ebon Vaults will not use customer files to train AI. Period.',
      'We will not monetize your information, hand it to model-builders, or treat vault contents as a side hustle. Subscription storage. Not data mining.',
    ],
  }),

  definePost({
    slug: 'websites-track-more-than-clicks',
    title: 'Websites Track Every Hover, Scroll, and Pause',
    excerpt:
      'It is not just cookies. Analytics can map where you linger, how far you scroll, and how long your cursor hangs over a sentence.',
    category: 'Web tracking',
    publishedAt: '2026-10-15',
    sources: [
      {
        outlet: 'Federal Trade Commission',
        headline:
          'FTC Report Finds Large Internet Service Providers Collected Troves of Personal Data',
        url: 'https://www.ftc.gov/news-events/news/press-releases/2024/03/ftc-staff-report-finds-many-large-internet-service-providers-collected-troves-personal-data-users',
        publishedAt: '2024-03-21',
      },
      {
        outlet: 'Federal Trade Commission',
        headline: 'Paying for Privacy: Pay-or-Tracking Walls (research paper)',
        url: 'https://www.ftc.gov/system/files/ftc_gov/pdf/muller.tribbensee.pay_.or_.tracking.walls_.pdf',
        publishedAt: '2024-01-01',
      },
      {
        outlet: 'Reuters Institute for the Study of Journalism',
        headline:
          'The Cookiepocalypse: Why first-party data is going to matter to your newsroom',
        url: 'https://reutersinstitute.politics.ox.ac.uk/cookiepocalypse-why-first-party-data-going-matter-your-newsroom',
        publishedAt: '2021-10-28',
      },
    ],
    whatHappened: [
      'Regulators keep documenting how platforms and ISPs harvest detailed personal and behavioral data — far beyond what most people notice while browsing.',
      'On the web itself, tracking stacks can log pages, scroll depth, referrals, timing, and interaction patterns — reconstructing a visit like a surveillance tape you never agreed to star in.',
    ],
    whyItMatters: [
      'One hover is nothing. A year of hovers is a dossier: what you research at 1 a.m., what you almost buy, what you are afraid to ask out loud.',
      'That measurement culture bleeds into cloud products. If a storage company also wants ads, AI, or partner data, your files stop being files and start being signals.',
    ],
    howEbonVaultsProtects: [
      'We reject the “data as inventory” model. No ad profiles built from your vault. No monetizing customer information.',
      'This site may collect waitlist details you choose to submit. Your future stored files are not fuel for tracking empires.',
    ],
  }),

  definePost({
    slug: 'data-breaches-and-why-storage-choices-matter',
    title: 'One Breach Can Dump Millions of Private Lives Online',
    excerpt:
      'Concentrate enough personal records in one place and a single failure turns strangers into owners of your most sensitive information.',
    category: 'Data breaches',
    publishedAt: '2026-10-12',
    sources: [
      {
        outlet: 'U.S. Department of Health & Human Services',
        headline: 'Change Healthcare Cyberattack Response & Recovery Resources',
        url: 'https://www.hhs.gov/hipaa/for-professionals/special-topics/change-healthcare-cybersecurity-threat/index.html',
        publishedAt: '2024-03-01',
      },
      {
        outlet: 'Federal Trade Commission',
        headline: 'FTC business guidance: Privacy & security',
        url: 'https://www.ftc.gov/business-guidance/privacy-security',
        publishedAt: '2024-01-01',
      },
      {
        outlet: 'Cybersecurity & Infrastructure Security Agency',
        headline: 'StopRansomware / cyber threat resources',
        url: 'https://www.cisa.gov/stopransomware',
        publishedAt: '2024-01-01',
      },
    ],
    whatHappened: [
      'Large-scale attacks against major data handlers have knocked out services and put enormous volumes of personal information at risk — proof that concentration creates catastrophe.',
      'Afterward comes the familiar ritual: notifications, password resets, credit freezes, and years of looking over your shoulder.',
    ],
    whyItMatters: [
      'Cloud storage piles up identity docs, finances, family photos, and work archives. Attackers go where the jackpot is.',
      'Security is not only firewalls. It is also whether your provider copies, analyzes, shares, or monetizes the same data that just became a target.',
    ],
    howEbonVaultsProtects: [
      'Ebon Vaults intends to run its own infrastructure and build encryption into the foundation. We are prelaunch — we will document verified practices as they are built, not invent guarantees early.',
      'We will not multiply exposure by monetizing, training on, giving away, or using customer information as a side business. Fewer secondary copies. Fewer reasons for your life to leak.',
    ],
  }),

  definePost({
    slug: 'we-will-not-monetize-your-information',
    title: 'You Are Not Inventory. Stop Paying Companies That Treat You Like It.',
    excerpt:
      'If the real product is your data, the subscription price is just cover. Here is the line Ebon Vaults will not cross.',
    category: 'Company principles',
    publishedAt: '2026-10-10',
    sources: [
      {
        outlet: 'Federal Trade Commission',
        headline: 'FTC business guidance: Privacy & security',
        url: 'https://www.ftc.gov/business-guidance/privacy-security',
        publishedAt: '2024-01-01',
      },
      {
        outlet: 'Federal Trade Commission',
        headline:
          'FTC Report Finds Large Internet Service Providers Collected Troves of Personal Data',
        url: 'https://www.ftc.gov/news-events/news/press-releases/2024/03/ftc-staff-report-finds-many-large-internet-service-providers-collected-troves-personal-data-users',
        publishedAt: '2024-03-21',
      },
      {
        outlet: 'The New York Times',
        headline: 'How Tech Giants Cut Corners to Harvest Data for A.I.',
        url: 'https://www.nytimes.com/2024/04/06/technology/tech-giants-harvest-data-artificial-intelligence.html',
        publishedAt: '2024-04-06',
      },
    ],
    whatHappened: [
      'Regulators keep warning companies not to mislead people about how personal data is collected, kept, and used — especially as AI products scramble for more of it.',
      'Vague policies are the tell: “product improvement” today becomes profiling, sharing, or model training tomorrow.',
    ],
    whyItMatters: [
      'If you cannot tell whether a storage product lives on subscriptions — or on mining you — you cannot trust it with your life’s files.',
      'The deal should be boring: you pay for space, they hold your files, nobody sells the leftovers.',
    ],
    howEbonVaultsProtects: [
      'We will not monetize customer information.',
      'We will not train AI on your files.',
      'We will not give your information away for someone else’s marketing or models.',
      'We will not use vault contents as a secondary product. Join the waitlist if you want that built.',
    ],
  }),
]

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug)
}

export function getAllPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) =>
    a.publishedAt < b.publishedAt ? 1 : -1,
  )
}

/** Hero story for /blog — falls back to newest if none marked primary. */
export function getPrimaryPost(): BlogPost {
  return BLOG_POSTS.find((post) => post.primary) ?? getAllPosts()[0]!
}

export function getSecondaryPosts(): BlogPost[] {
  const primary = getPrimaryPost()
  return getAllPosts().filter((post) => post.slug !== primary.slug)
}

export function formatPostDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  if (!year || !month || !day) return isoDate
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export function getPostPath(slug: string): string {
  return `/blog/${slug}`
}
