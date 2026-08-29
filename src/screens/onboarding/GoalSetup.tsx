import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { clamped } from '../../domain/clamp'
import { ozWhole } from '../../domain/format'
import {
  ACTIVITY_LEVELS,
  activityDescription,
  activityLabel,
  recommendedDailyGoal,
  type ActivityLevel,
} from '../../domain/onboarding'
import { DAILY_GOAL_RANGE } from '../../domain/types'

/** Port of `GoalSetupView.swift`. */
export function GoalSetup({ onContinue }: { onContinue: (goalOz: number) => void }) {
  const [weight, setWeight] = useState('')
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate')
  const [customGoal, setCustomGoal] = useState('64')
  const [useRecommended, setUseRecommended] = useState(true)

  const parsedWeight = weight.trim() === '' ? null : Number(weight)
  const hasWeight = parsedWeight != null && Number.isFinite(parsedWeight) && parsedWeight > 0
  const recommendedGoal = recommendedDailyGoal(hasWeight ? parsedWeight : null, activityLevel)

  const raw = useRecommended && hasWeight ? recommendedGoal : Number(customGoal)
  const finalGoal = clamped(
    Number.isFinite(raw) ? raw : 64,
    DAILY_GOAL_RANGE.min,
    DAILY_GOAL_RANGE.max,
  )

  return (
    <div className="screen">
      <div className="screen__scroll" style={{ paddingTop: 24 }}>
        <div className="stack" style={{ gap: 32 }}>
          <div className="center" style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
            <span style={{ color: 'var(--water)' }}>
              <Icon name="target" size={60} />
            </span>
            <h1 className="serif" style={{ fontSize: 28 }}>Set Your Daily Goal</h1>
            <p className="muted" style={{ margin: 0 }}>Let’s personalize your hydration target</p>
          </div>

          <div className="field">
            <span className="field__label">Weight (optional)</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                className="input"
                type="number"
                inputMode="decimal"
                min="1"
                placeholder="Enter weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
              <span className="muted">lbs</span>
            </div>
          </div>

          <div className="field">
            <span className="field__label">Activity Level</span>
            <div className="stack--tight" style={{ display: 'grid', gap: 8 }}>
              {ACTIVITY_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  className="option-row"
                  aria-pressed={activityLevel === level}
                  onClick={() => setActivityLevel(level)}
                >
                  <span>
                    <strong>{activityLabel[level]}</strong>
                    <span className="row__sub">{activityDescription[level]}</span>
                  </span>
                  {activityLevel === level && (
                    <span style={{ color: 'var(--terracotta)', display: 'inline-flex' }}>
                      <Icon name="checkmark.circle.fill" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {hasWeight && (
            <div className="stack--tight" style={{ display: 'grid', gap: 12 }}>
              <div className="spread highlight">
                <strong>Recommended Goal</strong>
                <strong style={{ color: 'var(--terracotta)' }}>{ozWhole(recommendedGoal)} oz</strong>
              </div>
              <p className="hint" style={{ margin: 0 }}>
                This is a general wellness estimate, not medical advice. Talk to a
                healthcare professional for personalized guidance.
              </p>
              <label className="spread">
                <span>Use recommended goal</span>
                <input
                  type="checkbox"
                  checked={useRecommended}
                  onChange={(e) => setUseRecommended(e.target.checked)}
                  style={{ width: 20, height: 20 }}
                />
              </label>
            </div>
          )}

          {(!useRecommended || !hasWeight) && (
            <div className="field">
              <span className="field__label">Custom Goal (oz)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  className="input"
                  type="number"
                  inputMode="decimal"
                  min={DAILY_GOAL_RANGE.min}
                  max={DAILY_GOAL_RANGE.max}
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                />
                <span className="muted">oz</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '0 32px 20px', display: 'grid', gap: 16 }}>
        <div className="spread card">
          <span style={{ fontSize: 20 }}>Your Goal:</span>
          <strong style={{ fontSize: 20, color: 'var(--terracotta)' }}>{ozWhole(finalGoal)} oz</strong>
        </div>
        <button type="button" className="btn btn--block" onClick={() => onContinue(finalGoal)}>
          Continue
        </button>
      </div>
    </div>
  )
}
