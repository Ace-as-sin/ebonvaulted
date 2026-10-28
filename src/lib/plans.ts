import type { PricingPlan } from '../types'

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'essential',
    name: 'Essential',
    storage: '100 GB',
    price: '$3.99',
    period: '/month',
    description: 'Secure file access and sharing for everyday personal use.',
    features: [
      '100 GB storage',
      'Secure file access',
      'File-sharing functionality',
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    storage: '500 GB',
    price: '$7.99',
    period: '/month',
    description: 'More capacity plus data encryption for stronger protection.',
    features: [
      '500 GB storage',
      'Everything in Essential',
      'Data encryption',
    ],
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    id: 'premium',
    name: 'Premium',
    storage: '1 TB',
    price: '$9.99',
    period: '/month',
    description: 'Maximum capacity with priority speeds and every Plus benefit.',
    features: [
      '1 TB storage',
      'Everything in Plus',
      'Priority speeds',
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
