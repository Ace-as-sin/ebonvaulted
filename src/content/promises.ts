/**
 * Planned customer commitments — reusable for waitlist preview
 * and future registration flows. Forward-looking until launch.
 */

export interface CustomerPromise {
  id: string
  headline: string
  body: string
  /** Permanent non-negotiable commitment — visual emphasis */
  emphasized?: boolean
  limitations?: string
}

export const CUSTOMER_PROMISES: CustomerPromise[] = [
  {
    id: 'ownership',
    headline: 'Your data belongs to you.',
    body: 'Your files remain yours. We don’t claim ownership of your personal information, photographs, documents, or other stored content.',
  },
  {
    id: 'never-sold',
    headline: 'Your data will never be sold.',
    body: 'We will never sell, rent, or license your files or their contents to advertisers, data brokers, or AI companies. Your files will never be used to train AI models. This is a non-negotiable company commitment.',
    emphasized: true,
  },
  {
    id: 'security',
    headline: 'Your data is protected with modern security.',
    body: 'We use encryption, access controls, and physical security measures designed to protect your information from unauthorized access.',
    limitations:
      'No security system can guarantee protection against every possible cyberattack, theft, or security incident.',
  },
  {
    id: 'redundancy',
    headline: 'Your data is stored with redundancy.',
    body: 'We use redundant storage systems designed to keep your files available even when an individual storage drive fails.',
    limitations:
      'Redundancy protects against certain hardware failures but cannot prevent every form of data loss, including disasters affecting the entire storage location.',
  },
  {
    id: 'privacy',
    headline: 'Your data stays private.',
    body: 'We don’t inspect your files for advertising, build marketing profiles from their contents, or share them with third parties for commercial exploitation.',
    limitations:
      'We may be legally required to respond to valid court orders or other legally binding requests for information in our possession.',
  },
  {
    id: 'care',
    headline: 'Your data is handled with care.',
    body: 'Our storage equipment is kept in a physically secured environment with safeguards designed to reduce the risk of unauthorized access or damage.',
    limitations:
      'Events such as fire, flooding, theft, natural disasters, or other circumstances beyond our reasonable control may still affect the equipment and stored files.',
  },
  {
    id: 'transparency',
    headline: 'Your subscription is transparent.',
    body: 'You’ll know your storage capacity, subscription price, and applicable usage limits before paying. We’ll clearly explain how cancellation and data retrieval work.',
    limitations:
      'Access to stored files may be affected by unpaid subscriptions or account termination under the service terms.',
  },
]

export const PROMISE_COUNT = CUSTOMER_PROMISES.length
