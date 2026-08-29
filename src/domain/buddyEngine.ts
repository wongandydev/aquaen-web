import { clamped } from './clamp'
import { daysBetween } from './dates'

/** The buddy's condition, ordered healthiest → worst.
 *
 *  Stages deliberately mirror the *severity bands* of real human dehydration
 *  (mild ~1–2% body-water loss, moderate ~3–5%, severe >5%), not a day
 *  countdown — clinical sources tie symptoms to severity, not to a "3-day clock". */
export type BuddyStage =
  /** Daily goal met. */
  | 'thriving'
  /** On pace for the day, recently drank. */
  | 'happy'
  /** Slightly behind pace — the "you're already ~1–2% down when you feel thirst" zone. */
  | 'content'
  /** Mild dehydration analog: headache, focus dip. */
  | 'thirsty'
  /** Moderate dehydration analog: fatigue, dizziness. */
  | 'parched'
  /** Severe territory: a full waking day (or more) with nothing logged. */
  | 'wilting'
  /** Multiple days with nothing logged — a human would be in real trouble. */
  | 'critical'

export const BUDDY_STAGES: BuddyStage[] = [
  'thriving',
  'happy',
  'content',
  'thirsty',
  'parched',
  'wilting',
  'critical',
]

/** Result of evaluating the buddy's condition at a moment in time. */
export interface BuddyEvaluation {
  stage: BuddyStage
  /** Raw progress toward the daily goal (may exceed 1). */
  goalFraction: number
  /** Hours since the most recent logged drink; `null` if nothing was ever logged. */
  hoursSinceLastDrink: number | null
}

/** Active day window used for pacing. Matches the notification quiet hours
 *  (10 PM – 7 AM) so the buddy never guilt-trips anyone for sleeping. */
export const ACTIVE_DAY_START = 7
export const ACTIVE_DAY_END = 22

export interface EvaluateInput {
  todayIntakeOz: number
  dailyGoalOz: number
  lastDrinkDate: Date | null
  now?: Date
}

/** Pure derivation of the buddy's stage from hydration history. No side effects,
 *  clock injected — everything here is unit-testable. */
export function evaluateBuddy({
  todayIntakeOz,
  dailyGoalOz,
  lastDrinkDate,
  now = new Date(),
}: EvaluateInput): BuddyEvaluation {
  const goal = Math.max(dailyGoalOz, 1)
  const goalFraction = Math.max(todayIntakeOz, 0) / goal

  // Never logged anything: a friendly nudge, not a guilt trip.
  if (!lastDrinkDate) {
    return { stage: 'thirsty', goalFraction, hoursSinceLastDrink: null }
  }

  const hoursSince = Math.max((now.getTime() - lastDrinkDate.getTime()) / 3_600_000, 0)
  const daysSince = daysBetween(lastDrinkDate, now)

  const result = (stage: BuddyStage): BuddyEvaluation => ({
    stage,
    goalFraction,
    hoursSinceLastDrink: hoursSince,
  })

  // Multi-day neglect dominates everything else.
  if (daysSince >= 3) return result('critical')
  if (daysSince === 2) return result('wilting')

  if (goalFraction >= 1) return result('thriving')

  const hour = now.getHours()

  // Last drink was yesterday and nothing today: escalate over the day.
  // An overnight dry spell is normal, so mornings stay gentle.
  if (daysSince === 1) {
    if (hour < 10) return result('thirsty')
    if (hour < 16) return result('parched')
    return result('wilting')
  }

  // Drank today: judge by pace against the elapsed active day.
  const expected = expectedGoalFraction(hour, now.getMinutes())
  const pace = goalFraction / expected

  let stage: BuddyStage
  if (pace >= 0.85) stage = 'happy'
  else if (pace >= 0.55) stage = 'content'
  else if (pace >= 0.3) stage = 'thirsty'
  else stage = 'parched'

  // A long gap since the last sip drags the buddy down one step even when the
  // running total looks fine — thirst (≈1–2% body-water down) sets in within hours.
  if (hoursSince >= 4) {
    if (stage === 'happy') stage = 'content'
    else if (stage === 'content') stage = 'thirsty'
  }

  return result(stage)
}

/** Fraction of the daily goal a steady drinker would have finished by now,
 *  spreading the goal evenly across the 7 AM – 10 PM active window.
 *  Floored at 0.1 so pre-dawn math never divides by ~zero. */
export function expectedGoalFraction(hour: number, minute: number): number {
  const elapsed = hour + minute / 60 - ACTIVE_DAY_START
  const window = ACTIVE_DAY_END - ACTIVE_DAY_START
  return clamped(elapsed / window, 0.1, 1)
}
