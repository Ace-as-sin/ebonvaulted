import { PRICING_PLANS } from './plans'
import type { StoragePlan } from '../types'

/**
 * Central pricing configuration for the interactive calculator.
 *
 * IMPORTANT — BUSINESS APPROVAL REQUIRED:
 * Usage-based rates below are ILLUSTRATIVE placeholders for prelaunch
 * exploration only. They are not approved published prices.
 *
 * Fixed-plan monthly prices are sourced from `plans.ts` (the site’s existing
 * preliminary test pricing) and remain subject to change before launch.
 *
 * Do not invent annual discounts here. Annual estimates use monthly × 12
 * unless `annualDiscountPercent` is explicitly set and approved.
 */

export const PRICING_DISCLAIMER =
  'Illustrative prelaunch estimates. Final billing policies and prices are subject to confirmation before launch.'

/** Convention used throughout the calculator UI and math. */
export const GB_PER_TB = 1000

export interface UsagePricingConfig {
  /** USD charged per GB of consumed storage per month. ILLUSTRATIVE. */
  pricePerGbMonth: number
  /** Floor on the monthly usage-based bill, even at 0 GB. ILLUSTRATIVE. */
  minimumMonthlyCharge: number
  /** Upper bound for the calculator slider / inputs. */
  maxStorageGb: number
  /** Lower bound for the calculator slider / inputs. */
  minStorageGb: number
  /**
   * Smallest billed storage step in GB for estimates.
   * Values are rounded up to this increment before pricing (except 0 GB).
   */
  billingIncrementGb: number
  /** Whether estimates assume constant usage for the full billing period. */
  assumesConstantUsage: boolean
  /** Taxes are never included in calculator estimates. */
  includesTaxes: boolean
}

export interface FixedPlanPricingConfig {
  id: StoragePlan
  name: string
  storageGb: number
  monthlyPrice: number
}

export interface PricingConfig {
  usage: UsagePricingConfig
  fixedPlans: FixedPlanPricingConfig[]
  /**
   * Optional annual discount percent (0–100). Leave undefined / 0 until an
   * approved discount exists — do not invent one.
   */
  annualDiscountPercent?: number
  storagePresetsGb: number[]
  defaultStorageGb: number
  currency: 'USD'
  locale: string
}

export const PRICING_CONFIG: PricingConfig = {
  usage: {
    // ILLUSTRATIVE — pending business approval
    pricePerGbMonth: 0.02,
    // ILLUSTRATIVE — pending business approval
    minimumMonthlyCharge: 1.99,
    maxStorageGb: 1000,
    minStorageGb: 0,
    billingIncrementGb: 1,
    assumesConstantUsage: true,
    includesTaxes: false,
  },
  fixedPlans: PRICING_PLANS.map((plan) => ({
    id: plan.id,
    name: plan.name,
    storageGb: plan.storageGb,
    monthlyPrice: plan.monthlyPrice,
  })),
  // No approved annual discount — annual = monthly × 12
  annualDiscountPercent: undefined,
  storagePresetsGb: [25, 100, 250, 500, 1000],
  defaultStorageGb: 175,
  currency: 'USD',
  locale: 'en-US',
}
