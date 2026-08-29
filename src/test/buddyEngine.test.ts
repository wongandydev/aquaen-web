import { describe, expect, it } from 'vitest'
import { evaluateBuddy, expectedGoalFraction, BUDDY_STAGES } from '../domain/buddyEngine'
import { HYDRATION_FACTS, factFor } from '../domain/hydrationFacts'

/** Port of `BuddyEngineTests.swift`. Dates are constructed in local time, so the
 *  suite is timezone-independent the way the Swift version's fixed UTC calendar is. */

function date(day: number, hour: number, minute = 0): Date {
  return new Date(2026, 6, day, hour, minute) // July 2026
}

function evaluate(
  todayIntakeOz: number,
  lastDrinkDate: Date | null,
  now: Date,
  dailyGoalOz = 64,
) {
  return evaluateBuddy({ todayIntakeOz, dailyGoalOz, lastDrinkDate, now })
}

describe('no history', () => {
  it('never logged is a gentle thirsty nudge', () => {
    const result = evaluate(0, null, date(15, 12))
    expect(result.stage).toBe('thirsty')
    expect(result.hoursSinceLastDrink).toBeNull()
  })
})

describe('goal met', () => {
  it('goal met is thriving', () => {
    const result = evaluate(64, date(15, 11), date(15, 12))
    expect(result.stage).toBe('thriving')
    expect(result.goalFraction).toBe(1)
  })
})

describe('multi-day neglect', () => {
  it('three days since last drink is critical', () => {
    expect(evaluate(0, date(12, 20), date(15, 8)).stage).toBe('critical')
  })

  it('two days since last drink is wilting', () => {
    expect(evaluate(0, date(13, 20), date(15, 8)).stage).toBe('wilting')
  })

  it('multi-day neglect dominates even contradictory intake', () => {
    // Inconsistent input (intake logged today but "last drink" days ago):
    // the documented ordering says neglect wins.
    expect(evaluate(70, date(13, 8), date(15, 12)).stage).toBe('wilting')
  })
})

describe('nothing yet today (last drink yesterday)', () => {
  it('dry morning stays gentle', () => {
    expect(evaluate(0, date(14, 21), date(15, 9, 59)).stage).toBe('thirsty')
  })

  it('dry midday escalates to parched', () => {
    expect(evaluate(0, date(14, 21), date(15, 10)).stage).toBe('parched')
  })

  it('dry evening escalates to wilting', () => {
    expect(evaluate(0, date(14, 21), date(15, 16)).stage).toBe('wilting')
  })
})

describe('pace bands (drank today)', () => {
  it('on pace is happy', () => {
    // Noon: expected fraction = 5/15 = 1/3. 50% of goal is well ahead of pace.
    expect(evaluate(32, date(15, 11), date(15, 12)).stage).toBe('happy')
  })

  it('slightly behind pace is content', () => {
    // Noon: 20% done vs ~33% expected → pace 0.6.
    expect(evaluate(12.8, date(15, 11), date(15, 12)).stage).toBe('content')
  })

  it('well behind pace is thirsty', () => {
    // Noon: 12% done → pace ~0.36.
    expect(evaluate(7.7, date(15, 11), date(15, 12)).stage).toBe('thirsty')
  })

  it('barely anything is parched', () => {
    // Noon: 5% done → pace ~0.15.
    expect(evaluate(3.2, date(15, 11), date(15, 12)).stage).toBe('parched')
  })
})

describe('stale last sip drags the stage down', () => {
  it('long gap since last sip demotes happy to content', () => {
    // Front-loaded a strong morning (ahead of pace at 6 PM), but nothing for 5+ hours.
    const result = evaluate(55, date(15, 12), date(15, 18))
    expect(result.goalFraction).toBeLessThan(1)
    expect(result.stage).toBe('content')
  })

  it('recent sip keeps happy', () => {
    expect(evaluate(55, date(15, 17), date(15, 18)).stage).toBe('happy')
  })

  it('long gap does not demote below the thirsty band', () => {
    // Already parched by pace: the gap demotion only applies to happy/content.
    expect(evaluate(3.2, date(15, 7), date(15, 12)).stage).toBe('parched')
  })
})

describe('guard rails', () => {
  it('zero goal does not divide by zero', () => {
    const result = evaluate(10, date(15, 11), date(15, 12), 0)
    expect(result.stage).toBe('thriving') // 10 oz against the 1 oz floor
    expect(Number.isFinite(result.goalFraction)).toBe(true)
  })

  it('expected fraction clamps outside the active day', () => {
    expect(expectedGoalFraction(5, 0)).toBe(0.1)
    expect(expectedGoalFraction(23, 0)).toBe(1)
  })

  it('a future last-drink date does not produce negative hours', () => {
    const result = evaluate(10, date(15, 14), date(15, 12))
    expect(result.hoursSinceLastDrink).toBe(0)
  })
})

describe('fact catalog', () => {
  it('every stage has at least one fact', () => {
    for (const stage of BUDDY_STAGES) {
      expect(
        HYDRATION_FACTS.some((fact) => fact.stages.includes(stage)),
        `no fact for ${stage}`,
      ).toBe(true)
    }
  })

  it('fact pick is deterministic and rotates', () => {
    const day = date(15, 12)
    const first = factFor('thriving', day, 0)
    const again = factFor('thriving', day, 0)
    const next = factFor('thriving', day, 1)
    expect(first).toEqual(again)
    expect(first).not.toEqual(next)
  })
})
