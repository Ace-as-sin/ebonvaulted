/**
 * Ebon Vaults blog — news brief format
 * ====================================
 * Each post explains:
 *   1. whatHappened
 *   2. whyItMatters
 *   3. howEbonVaultsProtects
 * then lists up to 3 source articles at the bottom of the page.
 *
 * Set primary: true on ONE post — it becomes the hero on /blog.
 * Shareable URL: /blog/<slug>
 */

export type BlogCategory =
  | 'AI & privacy'
  | 'Device surveillance'
  | 'Web tracking'
  | 'Data breaches'
  | 'Company principles'

/** External news / research article this brief cites. */
export interface NewsSource {
  outlet: string
  headline: string
  url: string
  publishedAt?: string
}

export interface BlogPostInput {
  slug: string
  title: string
  excerpt: string
  category: BlogCategory
  publishedAt: string
  /** 1–3 source articles shown at the bottom of the post */
  sources: NewsSource[]
  whatHappened: string[]
  whyItMatters: string[]
  howEbonVaultsProtects: string[]
  /** Marks the hero story on /blog — only one should be true */
  primary?: boolean
  readMinutes?: number
}

export interface BlogPost extends Omit<BlogPostInput, 'sources'> {
  sources: NewsSource[]
  readMinutes: number
}

const MAX_SOURCES = 3

function estimateReadMinutes(post: BlogPostInput): number {
  const words = [
    post.excerpt,
    ...post.whatHappened,
    ...post.whyItMatters,
    ...post.howEbonVaultsProtects,
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

  return {
    ...input,
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
 * Add up to 3 items in `sources` — they render at the bottom of the article.
 */
export const BLOG_POSTS: BlogPost[] = [
  definePost({
    slug: 'flock-cameras-keep-your-plates',
    title: 'The State Deletes Your Plate Data in 30 Days. The Camera Company Doesn’t Have To.',
    excerpt:
      'Flock Safety’s license-plate cameras log where cars go. Agencies talk about short retention windows. The vendor’s own terms tell a colder story about who still gets to keep using that trail.',
    category: 'Device surveillance',
    publishedAt: '2026-10-28',
    primary: true,
    sources: [
      {
        outlet: 'American Civil Liberties Union',
        headline:
          'Municipalities: Beware of Changes in Flock’s Legal Terms if You’re Using or Considering License Plate Readers',
        url: 'https://www.aclu.org/news/privacy-technology/tracking-alpr-cameras/flocks-terms-and-conditions',
        publishedAt: '2026-04-01',
      },
      {
        outlet: 'USA Today',
        headline:
          'Flock Safety changes data retention default to 7 days amid backlash',
        url: 'https://www.usatoday.com/story/news/state/georgia/atlanta/2026/08/14/flock-safety-changes-data-retention-default-to-7-days-amid-backlash/91300697007/',
        publishedAt: '2026-08-14',
      },
      {
        outlet: '10TV / WBNS',
        headline:
          'Reynoldsburg covers 32 Flock cameras after ending contract; what happens to collected data',
        url: 'https://www.10tv.com/article/news/local/reynoldsburg-covers-flock-cameras-what-happens-collected-data/530-971d2cc7-fd55-45a5-b618-3752f99461b2',
        publishedAt: '2026-09-10',
      },
    ],
    whatHappened: [
      'Flock Safety’s automated license plate readers photograph vehicles as they pass — plate, vehicle details, time, and location — then push that trail into a searchable cloud database used by police departments, cities, and other customers across the country.',
      'Public messaging leans on short retention: Flock long used a 30-day default, later pushed a 7-day recommendation under backlash, and some state rules (like Oregon’s) tell agencies to delete plate data unconnected to a case within about 30 days. That sounds like a sunset. It is not the whole contract.',
      'The ACLU has flagged Flock’s updated terms for granting the company a perpetual right to use customer data to “support and improve” its services — language that can outlive a city’s relationship with the product. Local reporting has also made the blunt point that ending a Flock contract does not, by itself, erase what was already collected: data can sit for the configured retention window unless the customer demands immediate deletion.',
    ],
    whyItMatters: [
      'A 30-day government retention rule is theater if the vendor’s paperwork still lets the company keep rights to your movements. “We delete it” and “the camera company is done with it” are not the same sentence.',
      'License-plate history is a map of where you live, work, worship, seek medical care, and protest. When that map lives on a private platform with network effects across agencies, one town’s “short retention” does not undo a national surveillance product.',
      'This is the large-company data pattern in neon: public-facing limits for the customer, durable rights for the vendor, and ordinary people stuck hoping a privacy policy meant what it sounded like.',
    ],
    howEbonVaultsProtects: [
      'Ebon Vaults is not building a roadside dossier of your car. We are building encrypted file storage — custody, not a surveillance network.',
      'We will not monetize customer information, train on it, give it away, or keep a side license to “improve our products” with your private files after you leave. If deletion and ownership mean anything, the company holding the data has to mean them too.',
    ],
  }),

  definePost({
    slug: 'smart-tvs-and-always-listening-devices',
    title: 'Your Smart TVs and Alexa Hear Everything — Then Keep the Tape',
    excerpt:
      'Parents hit delete. The Alexa recordings stayed. Regulators say kids’ living-room audio from smart speakers and always-on devices was kept forever and used to improve the system anyway.',
    category: 'Device surveillance',
    publishedAt: '2026-10-28',
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

/** Pin these slugs to the top of the “More…” grid (after the hero). */
const PINNED_LIST_SLUGS = ['smart-tvs-and-always-listening-devices']

export function getSecondaryPosts(): BlogPost[] {
  const primary = getPrimaryPost()
  return getAllPosts()
    .filter((post) => post.slug !== primary.slug)
    .sort((a, b) => {
      const aPin = PINNED_LIST_SLUGS.indexOf(a.slug)
      const bPin = PINNED_LIST_SLUGS.indexOf(b.slug)
      if (aPin !== -1 || bPin !== -1) {
        if (aPin === -1) return 1
        if (bPin === -1) return -1
        return aPin - bPin
      }
      return a.publishedAt < b.publishedAt ? 1 : -1
    })
}

export function searchPosts(query: string, posts: BlogPost[] = getAllPosts()): BlogPost[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return posts

  const terms = normalized.split(/\s+/).filter(Boolean)

  return posts.filter((post) => {
    const haystack = [
      post.title,
      post.excerpt,
      post.category,
      ...post.whatHappened,
      ...post.whyItMatters,
      ...post.howEbonVaultsProtects,
      ...post.sources.map((source) => `${source.outlet} ${source.headline}`),
    ]
      .join(' ')
      .toLowerCase()

    return terms.every((term) => haystack.includes(term))
  })
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
