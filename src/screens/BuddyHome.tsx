import { useCallback, useEffect, useRef, useState } from 'react'
import { BuddyCharacter } from '../components/BuddyCharacter'
import { Icon } from '../components/Icon'
import { Meter } from '../components/Meter'
import { evaluateBuddy, type BuddyStage } from '../domain/buddyEngine'
import { displayName, headline, humanNote, labelColor, quips } from '../domain/buddyStage'
import { clamped } from '../domain/clamp'
import { factFor } from '../domain/hydrationFacts'
import { ozWhole } from '../domain/format'
import { ENTRY_VOLUME_RANGE, type Container } from '../domain/types'
import { useNow } from '../hooks/useNow'
import { useAppState } from '../store/AppState'
import './BuddyHome.css'

/** The home tab: the water buddy front and centre, kept alive by logging drinks.
 *  Stage comes from `evaluateBuddy`; the educational card explains what a human
 *  would feel at the same level of dehydration. Port of `BuddyHomeView.swift`. */
export function BuddyHome({ onAddDrink }: { onAddDrink: () => void }) {
  const { data, dispatch, totalTodayOz, dailyGoalOz, lastDrinkDate, buddyName, defaultContainer } =
    useAppState()
  const now = useNow()

  const [quip, setQuip] = useState<string | null>(null)
  const [factOffset, setFactOffset] = useState(0)
  const quipTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(quipTimer.current), [])

  /** Puts `text` in the speech bubble for a beat, replacing whatever is there. */
  const showMessage = useCallback((text: string) => {
    window.clearTimeout(quipTimer.current)
    setQuip(text)
    quipTimer.current = window.setTimeout(() => setQuip(null), 2500)
  }, [])

  const showQuip = useCallback(
    (stage: BuddyStage) => {
      const pool = quips[stage]
      showMessage(pool[Math.floor(Math.random() * pool.length)])
    },
    [showMessage],
  )

  const evaluation = evaluateBuddy({
    todayIntakeOz: totalTodayOz,
    dailyGoalOz,
    lastDrinkDate,
    now,
  })

  const fact = factFor(evaluation.stage, now, factOffset)
  const accent = labelColor(evaluation.stage)

  /** Default container first (if set), then other saved containers, capped at 2. */
  const quickAdd: Container[] = []
  if (defaultContainer) quickAdd.push(defaultContainer)
  for (const container of data.containers) {
    if (quickAdd.length >= 2) break
    if (quickAdd.some((c) => c.id === container.id)) continue
    quickAdd.push(container)
  }

  const logContainer = (container: Container) => {
    // Container volumes are unclamped, so a container above the per-entry cap logs
    // the cap rather than its face value. AddDrink surfaces that as a
    // confirm-on-second-tap, which doesn't fit a one-tap quick add — say it in the
    // bubble instead, but never clamp silently.
    const amount = clamped(container.volumeOz, ENTRY_VOLUME_RANGE.min, ENTRY_VOLUME_RANGE.max)
    dispatch({ type: 'addDrink', volume: amount, drinkType: 'water', containerId: container.id })

    if (amount !== container.volumeOz) {
      showMessage(`Logged ${ozWhole(amount)} oz — that's my max in one go.`)
    } else {
      showQuip('happy')
    }
  }

  return (
    <div className="screen">
      <header className="nav">
        <h1 className="nav__title">{buddyName}</h1>
        <div className="nav__actions">
          <button type="button" className="icon-btn" onClick={onAddDrink} aria-label="Add Drink">
            <Icon name="plus.circle.fill" size={26} />
          </button>
        </div>
      </header>

      <div className="screen__scroll">
        <div className="stack">
          <p className={`bubble ${quip ? 'bubble--visible' : ''}`} aria-live="polite">
            {quip ?? ' '}
          </p>

          <div className="buddy-stage">
            <BuddyCharacter
              stage={evaluation.stage}
              fillFraction={evaluation.goalFraction}
              onTap={() => showQuip(evaluation.stage)}
            />
          </div>

          <div className="stack--tight center" style={{ display: 'grid', gap: 6, justifyItems: 'center' }}>
            <h2 className="serif" style={{ fontSize: 22, fontWeight: 600 }}>
              {headline(evaluation.stage, buddyName)}
            </h2>
            <span
              className="chip"
              style={{
                color: accent,
                background: `color-mix(in srgb, ${accent} 15%, transparent)`,
              }}
            >
              {displayName[evaluation.stage]}
            </span>
          </div>

          <section className="card">
            <div className="spread" style={{ alignItems: 'baseline' }}>
              <span>
                <strong style={{ fontSize: 20 }}>{ozWhole(totalTodayOz)} oz</strong>{' '}
                <span className="muted" style={{ fontSize: 15 }}>
                  of {ozWhole(dailyGoalOz)} oz today
                </span>
              </span>
              {evaluation.goalFraction >= 1 && (
                <span style={{ color: 'var(--sage)', display: 'inline-flex' }}>
                  <Icon name="checkmark.seal.fill" label="Goal met" />
                </span>
              )}
            </div>
            <div style={{ marginTop: 10 }}>
              <Meter
                value={totalTodayOz}
                total={dailyGoalOz}
                color={evaluation.goalFraction >= 1 ? 'var(--sage)' : 'var(--water)'}
              />
            </div>
          </section>

          <button
            type="button"
            className="card fact-card"
            onClick={() => setFactOffset((offset) => offset + 1)}
          >
            <span className="fact-card__kicker">
              <Icon name="book.closed.fill" size={14} />
              The human angle
            </span>
            <p className="serif" style={{ margin: 0 }}>{humanNote[evaluation.stage]}</p>
            <hr className="fact-card__rule" />
            <p className="muted" style={{ margin: 0, fontSize: 14 }}>{fact.text}</p>
            <p className="muted" style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>
              Source: {fact.source} · tap for another
            </p>
          </button>

          <div className="quick-add">
            {quickAdd.map((container) => (
              <button
                key={container.id}
                type="button"
                className="quick-add__btn"
                onClick={() => logContainer(container)}
              >
                <Icon name="drop.fill" />
                <span className="quick-add__label">
                  {container.name} · {ozWhole(container.volumeOz)} oz
                </span>
              </button>
            ))}
            <button type="button" className="quick-add__btn quick-add__btn--more" onClick={onAddDrink}>
              <Icon name="plus" />
              <span className="quick-add__label">More</span>
            </button>
          </div>

          <p className="muted center" style={{ fontSize: 12, opacity: 0.7, margin: 0 }}>
            Aquaen shares general hydration information, not medical advice.
          </p>
        </div>
      </div>
    </div>
  )
}
