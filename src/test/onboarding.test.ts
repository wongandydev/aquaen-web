import { describe, expect, it } from 'vitest'
import { recommendedDailyGoal } from '../domain/onboarding'
import { clamped } from '../domain/clamp'
import { dayIndex, daysBetween, isToday, isYesterday } from '../domain/dates'

/** Port of `OnboardingFinalizerTests` coverage for the goal maths, plus the date
 *  helpers the web build substitutes for `Calendar`. */

describe('recommendedDailyGoal', () => {
  it('falls back to 64 oz when weight is unknown', () => {
    expect(recommendedDailyGoal(null, 'low')).toBe(64)
  })

  it('scales with weight at 0.67 oz per pound', () => {
    expect(recommendedDailyGoal(150, 'low')).toBeCloseTo(100.5, 5)
  })

  it('applies the activity multiplier', () => {
    expect(recommendedDailyGoal(150, 'moderate')).toBeCloseTo(100.5 * 1.2, 5)
    expect(recommendedDailyGoal(150, 'high')).toBeCloseTo(100.5 * 1.5, 5)
  })
})

describe('clamped', () => {
  it('bounds on both sides and passes values through', () => {
    expect(clamped(0, 1, 500)).toBe(1)
    expect(clamped(900, 1, 500)).toBe(500)
    expect(clamped(64, 1, 500)).toBe(64)
  })

  it('does not propagate NaN into the UI', () => {
    expect(clamped(Number.NaN, 1, 500)).toBe(1)
  })
})

describe('date helpers', () => {
  it('counts whole calendar days, not 24-hour blocks', () => {
    const lateMonday = new Date(2026, 6, 13, 23, 30)
    const earlyTuesday = new Date(2026, 6, 14, 0, 30)
    expect(daysBetween(lateMonday, earlyTuesday)).toBe(1)
  })

  it('recognises today and yesterday relative to an injected now', () => {
    const now = new Date(2026, 6, 15, 12)
    expect(isToday(new Date(2026, 6, 15, 1), now)).toBe(true)
    expect(isToday(new Date(2026, 6, 14, 23), now)).toBe(false)
    expect(isYesterday(new Date(2026, 6, 14, 23), now)).toBe(true)
  })

  it('day index increases by one per calendar day', () => {
    expect(dayIndex(new Date(2026, 6, 16)) - dayIndex(new Date(2026, 6, 15))).toBe(1)
  })
})
