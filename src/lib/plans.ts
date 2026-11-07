import type { PricingPlan, StoragePlan } from '../types'

/**
 * Fixed storage plans shown on the site and used by the pricing calculator.
 * Display strings (`price`, `storage`) stay in sync with numeric fields used
 * for calculations (1 TB = 1,000 GB).
 */
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'essential',
    name: 'Essential',
    storage: '100 GB',
    storageGb: 100,
    price: '$3.99',
    monthlyPrice: 3.99,
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
    storageGb: 500,
    price: '$7.99',
    monthlyPrice: 7.99,
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
    storageGb: 1000,
    price: '$9.99',
    monthlyPrice: 9.99,
    period: '/month',
    description: 'Maximum capacity with priority speeds and every Plus benefit.',
    features: [
      '1 TB storage',
      'Everything in Plus',
      'Priority speeds',
    ],
  },
]

export const PLAN_LABELS: Record<StoragePlan, string> = {
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

export function getPlanById(id: StoragePlan): PricingPlan {
  const plan = PRICING_PLANS.find((p) => p.id === id)
  if (!plan) {
    throw new Error(`Unknown storage plan: ${id}`)
  }
  return plan
}
