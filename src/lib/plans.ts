import type { PricingPlan } from '../types'

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'essential',
    name: 'Essential',
    storage: '100 GB',
    price: '$4.99',
    period: '/month',
    description: 'Private encrypted storage for everyday personal files.',
    features: [
      '100 GB storage',
      'Private encrypted storage',
      'Secure file access',
      'File-sharing functionality',
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    storage: '500 GB',
    price: '$9.99',
    period: '/month',
    description: 'More room for photos, videos, and growing archives.',
    features: [
      '500 GB storage',
      'Everything in Essential',
      'Increased storage capacity',
    ],
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    id: 'premium',
    name: 'Premium',
    storage: '1 TB',
    price: '$14.99',
    period: '/month',
    description: 'Expanded capacity for larger libraries and workflows.',
    features: [
      '1 TB storage',
      'Everything in Plus',
      '1 TB storage capacity',
    ],
  },
]

export const PLAN_LABELS: Record<string, string> = {
  essential: 'Essential — 100 GB',
  plus: 'Plus — 500 GB',
  premium: 'Premium — 1 TB',
}

export const INTENDED_USE_OPTIONS = [
  { value: 'personal', label: 'Personal files' },
  { value: 'photos', label: 'Photos / videos' },
  { value: 'business', label: 'Business documents' },
  { value: 'other', label: 'Other' },
] as const
