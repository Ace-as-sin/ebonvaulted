import {
  GB_PER_TB,
  PRICING_CONFIG,
  type FixedPlanPricingConfig,
  type PricingConfig,
} from './pricingConfig'
import type { BillingPeriod, PricingModel, StoragePlan } from '../types'

export interface UsageCostResult {
  usedGb: number
  billedGb: number
  monthlyCost: number
  annualCost: number
  effectivePerGb: number | null
  minimumApplied: boolean
}

export interface FixedCostResult {
  usedGb: number
  plan: FixedPlanPricingConfig | null
  monthlyCost: number | null
  annualCost: number | null
  effectivePerGb: number | null
  sufficient: boolean
  unusedGb: number
  nextPlan: FixedPlanPricingConfig | null
}

export interface ModelComparison {
  usageMonthly: number
  fixedMonthly: number | null
  /** Positive when usage-based is cheaper; negative when fixed is cheaper. */
  monthlyDelta: number | null
  cheaperModel: PricingModel | 'tie' | null
  suitableFixedPlan: FixedPlanPricingConfig | null
}

export interface PricingEstimate {
  storageGb: number
  model: PricingModel
  billingPeriod: BillingPeriod
  usage: UsageCostResult
  fixed: FixedCostResult
  comparison: ModelComparison
  displayMonthly: number | null
  displayAnnual: number | null
  displayPeriodCost: number | null
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Round monetary values for display / billing presentation only. */
export function roundMoney(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100
}

export function formatCurrency(
  amount: number,
  locale = PRICING_CONFIG.locale,
  currency = PRICING_CONFIG.currency,
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatStorageGb(gb: number): string {
  if (gb >= GB_PER_TB && gb % GB_PER_TB === 0) {
    const tb = gb / GB_PER_TB
    return tb === 1 ? '1 TB' : `${tb} TB`
  }
  if (Number.isInteger(gb)) {
    return `${gb} GB`
  }
  return `${Number(gb.toFixed(2))} GB`
}

/**
 * Normalize user input into a valid storage amount within calculator bounds.
 * Empty / invalid input returns null so the UI can keep editing state.
 */
export function parseStorageInput(
  raw: string,
  config: PricingConfig = PRICING_CONFIG,
): number | null {
  const trimmed = raw.trim()
  if (trimmed === '') return null
  const value = Number(trimmed)
  if (!Number.isFinite(value) || value < 0) return null
  return clamp(
    value,
    config.usage.minStorageGb,
    config.usage.maxStorageGb,
  )
}

/** Billable GB for usage pricing: 0 stays 0; otherwise round up to increment. */
export function billableUsageGb(
  usedGb: number,
  config: PricingConfig = PRICING_CONFIG,
): number {
  const { minStorageGb, maxStorageGb, billingIncrementGb } = config.usage
  const clamped = clamp(usedGb, minStorageGb, maxStorageGb)
  if (clamped <= 0) return 0
  const increment = Math.max(billingIncrementGb, Number.EPSILON)
  return Math.ceil(clamped / increment - Number.EPSILON) * increment
}

export function annualFromMonthly(
  monthlyCost: number,
  config: PricingConfig = PRICING_CONFIG,
): number {
  const discount = config.annualDiscountPercent ?? 0
  const factor = 1 - clamp(discount, 0, 100) / 100
  return monthlyCost * 12 * factor
}

export function calculateUsageCost(
  usedGb: number,
  config: PricingConfig = PRICING_CONFIG,
): UsageCostResult {
  const billedGb = billableUsageGb(usedGb, config)
  const raw = billedGb * config.usage.pricePerGbMonth
  const minimumApplied = raw < config.usage.minimumMonthlyCharge
  const monthlyCost = roundMoney(
    Math.max(config.usage.minimumMonthlyCharge, raw),
  )
  const annualCost = roundMoney(annualFromMonthly(monthlyCost, config))
  const effectivePerGb =
    billedGb > 0 ? monthlyCost / billedGb : null

  return {
    usedGb: clamp(usedGb, config.usage.minStorageGb, config.usage.maxStorageGb),
    billedGb,
    monthlyCost,
    annualCost,
    effectivePerGb,
    minimumApplied,
  }
}

/** Smallest fixed plan that can hold `usedGb`, or null if none fit. */
export function selectFixedPlan(
  usedGb: number,
  config: PricingConfig = PRICING_CONFIG,
): FixedPlanPricingConfig | null {
  const sorted = [...config.fixedPlans].sort(
    (a, b) => a.storageGb - b.storageGb,
  )
  return sorted.find((plan) => plan.storageGb >= usedGb) ?? null
}

export function nextLargerPlan(
  plan: FixedPlanPricingConfig | null,
  config: PricingConfig = PRICING_CONFIG,
): FixedPlanPricingConfig | null {
  if (!plan) {
    const sorted = [...config.fixedPlans].sort(
      (a, b) => a.storageGb - b.storageGb,
    )
    return sorted[0] ?? null
  }
  const sorted = [...config.fixedPlans].sort(
    (a, b) => a.storageGb - b.storageGb,
  )
  const index = sorted.findIndex((p) => p.id === plan.id)
  if (index < 0) return null
  return sorted[index + 1] ?? null
}

export function calculateFixedCost(
  usedGb: number,
  selectedPlanId?: StoragePlan,
  config: PricingConfig = PRICING_CONFIG,
): FixedCostResult {
  const clamped = clamp(
    usedGb,
    config.usage.minStorageGb,
    config.usage.maxStorageGb,
  )

  const autoPlan = selectFixedPlan(clamped, config)
  const explicit =
    selectedPlanId !== undefined
      ? (config.fixedPlans.find((p) => p.id === selectedPlanId) ?? null)
      : null

  // When a plan is explicitly selected (fixed-model UI), keep it for messaging
  // even if capacity is insufficient. Otherwise auto-pick the smallest fit.
  const plan = explicit ?? autoPlan

  if (!plan) {
    return {
      usedGb: clamped,
      plan: null,
      monthlyCost: null,
      annualCost: null,
      effectivePerGb: null,
      sufficient: false,
      unusedGb: 0,
      nextPlan: null,
    }
  }

  const sufficient = plan.storageGb >= clamped
  const monthlyCost = sufficient ? roundMoney(plan.monthlyPrice) : null
  const annualCost =
    monthlyCost !== null
      ? roundMoney(annualFromMonthly(monthlyCost, config))
      : null
  const unusedGb = sufficient ? Math.max(0, plan.storageGb - clamped) : 0
  const effectivePerGb =
    monthlyCost !== null && plan.storageGb > 0
      ? monthlyCost / plan.storageGb
      : null

  return {
    usedGb: clamped,
    plan,
    monthlyCost,
    annualCost,
    effectivePerGb,
    sufficient,
    unusedGb,
    nextPlan: sufficient
      ? nextLargerPlan(plan, config)
      : (autoPlan ?? nextLargerPlan(plan, config)),
  }
}

export function compareModels(
  usage: UsageCostResult,
  fixed: FixedCostResult,
): ModelComparison {
  if (fixed.monthlyCost === null || !fixed.sufficient) {
    return {
      usageMonthly: usage.monthlyCost,
      fixedMonthly: null,
      monthlyDelta: null,
      cheaperModel: null,
      suitableFixedPlan: null,
    }
  }

  const monthlyDelta = roundMoney(fixed.monthlyCost - usage.monthlyCost)
  let cheaperModel: PricingModel | 'tie'
  if (Math.abs(monthlyDelta) < 0.005) {
    cheaperModel = 'tie'
  } else if (monthlyDelta > 0) {
    cheaperModel = 'usage'
  } else {
    cheaperModel = 'fixed'
  }

  return {
    usageMonthly: usage.monthlyCost,
    fixedMonthly: fixed.monthlyCost,
    monthlyDelta,
    cheaperModel,
    suitableFixedPlan: fixed.plan,
  }
}

export function buildPricingEstimate(options: {
  storageGb: number
  model: PricingModel
  billingPeriod: BillingPeriod
  selectedFixedPlanId?: StoragePlan
  config?: PricingConfig
}): PricingEstimate {
  const config = options.config ?? PRICING_CONFIG
  const usage = calculateUsageCost(options.storageGb, config)

  // Display uses the explicitly selected fixed plan (may be insufficient).
  const fixed = calculateFixedCost(
    options.storageGb,
    options.model === 'fixed' ? options.selectedFixedPlanId : undefined,
    config,
  )

  // Model comparison always uses the smallest sufficient fixed plan so the
  // savings message stays honest and independent of dropdown selection.
  const suitableFixed = calculateFixedCost(options.storageGb, undefined, config)
  const comparison = compareModels(usage, suitableFixed)

  const displayMonthly =
    options.model === 'usage' ? usage.monthlyCost : fixed.monthlyCost
  const displayAnnual =
    options.model === 'usage' ? usage.annualCost : fixed.annualCost
  const displayPeriodCost =
    options.billingPeriod === 'annual' ? displayAnnual : displayMonthly

  return {
    storageGb: usage.usedGb,
    model: options.model,
    billingPeriod: options.billingPeriod,
    usage,
    fixed,
    comparison,
    displayMonthly,
    displayAnnual,
    displayPeriodCost,
  }
}

/** Map calculator selection to the waitlist’s existing StoragePlan field. */
export function recommendWaitlistPlan(
  storageGb: number,
  model: PricingModel,
  selectedFixedPlanId: StoragePlan | undefined,
  config: PricingConfig = PRICING_CONFIG,
): StoragePlan {
  if (model === 'fixed' && selectedFixedPlanId) {
    return selectedFixedPlanId
  }

  const fit = selectFixedPlan(storageGb, config)
  if (fit) return fit.id

  const largest = [...config.fixedPlans].sort(
    (a, b) => b.storageGb - a.storageGb,
  )[0]
  return largest?.id ?? 'plus'
}
