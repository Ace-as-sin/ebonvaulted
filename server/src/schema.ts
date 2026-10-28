import { z } from 'zod'

export const STORAGE_PLANS = ['essential', 'plus', 'premium'] as const
export const INTENDED_USES = [
  'personal',
  'photos',
  'business',
  'other',
] as const
export const PRIVACY_FEATURES = [
  'encryption',
  'no_ai_training',
  'no_data_sale',
  'independent_infrastructure',
  'customer_controlled_keys',
  'other',
] as const

export const waitlistBodySchema = z.object({
  email: z
    .string()
    .trim()
    .min(3)
    .max(320)
    .email()
    .transform((value) => value.toLowerCase()),
  plan: z.enum(STORAGE_PLANS),
  intendedUse: z.enum(INTENDED_USES),
  privacyFeature: z.enum(PRIVACY_FEATURES),
  feedback: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Explicit consent is required' }),
  }),
  consentPolicyVersion: z.string().min(1).max(64).optional(),
})

export type WaitlistBody = z.infer<typeof waitlistBodySchema>

export const PRIVACY_FEATURE_LABELS: Record<
  (typeof PRIVACY_FEATURES)[number],
  string
> = {
  encryption: 'Encrypted storage',
  no_ai_training: 'No AI training on my files',
  no_data_sale: 'Never sell my data',
  independent_infrastructure: 'Independent infrastructure',
  customer_controlled_keys: 'Customer-controlled encryption keys',
  other: 'Other',
}
