import { describe, expect, it } from 'vitest'
import {
  annualFromMonthly,
  billableUsageGb,
  buildPricingEstimate,
  calculateFixedCost,
  calculateUsageCost,
  compareModels,
  formatCurrency,
  formatStorageGb,
  parseStorageInput,
  recommendWaitlistPlan,
  roundMoney,
  selectFixedPlan,
} from './pricing'
import { PRICING_CONFIG } from './pricingConfig'

describe('roundMoney', () => {
  it('rounds to two decimal places', () => {
    expect(roundMoney(1.005)).toBe(1.01)
    expect(roundMoney(3.994)).toBe(3.99)
  })
})

describe('billableUsageGb', () => {
  it('keeps 0 GB at 0', () => {
    expect(billableUsageGb(0)).toBe(0)
  })

  it('rounds fractional usage up to the billing increment', () => {
    expect(billableUsageGb(100.1)).toBe(101)
    expect(billableUsageGb(100)).toBe(100)
  })
})

describe('calculateUsageCost', () => {
  const min = PRICING_CONFIG.usage.minimumMonthlyCharge
  const rate = PRICING_CONFIG.usage.pricePerGbMonth

  it('applies the minimum charge at 0 GB', () => {
    const result = calculateUsageCost(0)
    expect(result.billedGb).toBe(0)
    expect(result.monthlyCost).toBe(roundMoney(min))
    expect(result.minimumApplied).toBe(true)
    expect(result.effectivePerGb).toBeNull()
    expect(result.annualCost).toBe(roundMoney(min * 12))
  })

  it('prices 100 GB as max(minimum, 100 × rate)', () => {
    const result = calculateUsageCost(100)
    const expected = roundMoney(Math.max(min, 100 * rate))
    expect(result.billedGb).toBe(100)
    expect(result.monthlyCost).toBe(expected)
    expect(result.annualCost).toBe(roundMoney(expected * 12))
    expect(result.effectivePerGb).toBeCloseTo(expected / 100)
  })

  it('prices 175 GB correctly', () => {
    const result = calculateUsageCost(175)
    const expected = roundMoney(Math.max(min, 175 * rate))
    expect(result.monthlyCost).toBe(expected)
    expect(result.minimumApplied).toBe(175 * rate < min)
  })

  it('prices 500 GB and 1000 GB without inventing discounts', () => {
    for (const gb of [500, 1000]) {
      const result = calculateUsageCost(gb)
      const expected = roundMoney(Math.max(min, gb * rate))
      expect(result.monthlyCost).toBe(expected)
      expect(result.annualCost).toBe(roundMoney(expected * 12))
    }
  })
})

describe('selectFixedPlan / calculateFixedCost', () => {
  it('selects Essential at 0 and 100 GB', () => {
    expect(selectFixedPlan(0)?.id).toBe('essential')
    expect(selectFixedPlan(100)?.id).toBe('essential')
  })

  it('selects Plus at 175 GB and 500 GB', () => {
    expect(selectFixedPlan(175)?.id).toBe('plus')
    expect(selectFixedPlan(500)?.id).toBe('plus')
  })

  it('selects Premium at 1000 GB', () => {
    expect(selectFixedPlan(1000)?.id).toBe('premium')
  })

  it('reports unused capacity for a sufficient plan', () => {
    const result = calculateFixedCost(175, 'plus')
    expect(result.sufficient).toBe(true)
    expect(result.unusedGb).toBe(325)
    expect(result.monthlyCost).toBe(7.99)
    expect(result.annualCost).toBe(roundMoney(7.99 * 12))
  })

  it('marks an undersized explicit plan as insufficient', () => {
    const result = calculateFixedCost(175, 'essential')
    expect(result.sufficient).toBe(false)
    expect(result.monthlyCost).toBeNull()
    expect(result.nextPlan?.id).toBe('plus')
  })

  it('uses plan boundary prices from configuration', () => {
    expect(calculateFixedCost(100, 'essential').monthlyCost).toBe(3.99)
    expect(calculateFixedCost(500, 'plus').monthlyCost).toBe(7.99)
    expect(calculateFixedCost(1000, 'premium').monthlyCost).toBe(9.99)
  })
})

describe('compareModels', () => {
  it('never presents a negative delta as a usage saving', () => {
    const usage = calculateUsageCost(1000)
    const fixed = calculateFixedCost(1000)
    const comparison = compareModels(usage, fixed)

    expect(comparison.fixedMonthly).not.toBeNull()
    expect(comparison.monthlyDelta).not.toBeNull()

    if (comparison.cheaperModel === 'usage') {
      expect(comparison.monthlyDelta!).toBeGreaterThan(0)
    }
    if (comparison.cheaperModel === 'fixed') {
      expect(comparison.monthlyDelta!).toBeLessThan(0)
      expect(Math.abs(comparison.monthlyDelta!)).toBe(
        roundMoney(usage.monthlyCost - comparison.fixedMonthly!),
      )
    }
  })

  it('computes the absolute monthly difference honestly at 175 GB', () => {
    const usage = calculateUsageCost(175)
    const fixed = calculateFixedCost(175)
    const comparison = compareModels(usage, fixed)
    expect(comparison.suitableFixedPlan?.id).toBe('plus')
    expect(comparison.monthlyDelta).toBe(
      roundMoney((fixed.monthlyCost ?? 0) - usage.monthlyCost),
    )
  })
})

describe('annualFromMonthly', () => {
  it('multiplies by 12 when no discount is configured', () => {
    expect(PRICING_CONFIG.annualDiscountPercent ?? 0).toBe(0)
    expect(annualFromMonthly(7.99)).toBeCloseTo(95.88)
  })
})

describe('formatters and parsing', () => {
  it('formats currency with Intl.NumberFormat', () => {
    expect(formatCurrency(7.99)).toMatch(/\$7\.99/)
  })

  it('formats 1000 GB as 1 TB', () => {
    expect(formatStorageGb(1000)).toBe('1 TB')
    expect(formatStorageGb(175)).toBe('175 GB')
  })

  it('parses and clamps numeric input', () => {
    expect(parseStorageInput('')).toBeNull()
    expect(parseStorageInput('abc')).toBeNull()
    expect(parseStorageInput('-5')).toBeNull()
    expect(parseStorageInput('175')).toBe(175)
    expect(parseStorageInput('5000')).toBe(1000)
  })
})

describe('buildPricingEstimate / waitlist recommendation', () => {
  it('builds a coherent estimate for representative values', () => {
    for (const gb of [0, 100, 175, 500, 1000]) {
      const estimate = buildPricingEstimate({
        storageGb: gb,
        model: 'usage',
        billingPeriod: 'monthly',
      })
      expect(estimate.displayMonthly).toBe(estimate.usage.monthlyCost)
      expect(estimate.displayAnnual).toBe(estimate.usage.annualCost)
    }
  })

  it('recommends the suitable fixed plan for waitlist handoff', () => {
    expect(recommendWaitlistPlan(175, 'usage', undefined)).toBe('plus')
    expect(recommendWaitlistPlan(50, 'fixed', 'essential')).toBe('essential')
    expect(recommendWaitlistPlan(1000, 'usage', undefined)).toBe('premium')
  })
})
