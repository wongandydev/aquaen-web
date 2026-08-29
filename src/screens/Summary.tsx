import { useState } from 'react'
import { Confirm } from '../components/Confirm'
import { Icon } from '../components/Icon'
import { Meter } from '../components/Meter'
import { dayFormatter, dayIndex, isToday, isYesterday, timeFormatter } from '../domain/dates'
import { oz, ozWhole } from '../domain/format'
import type { DrinkEntry } from '../domain/types'
import { useAppState } from '../store/AppState'

/** Port of `SummaryView.swift`: today's progress on top, the full history below,
 *  grouped into Today / Yesterday / dated sections. */
export function Summary({ onAddDrink }: { onAddDrink: () => void }) {
  const {
    data,
    dispatch,
    entriesNewestFirst,
    todaysEntries,
    totalTodayOz,
    dailyGoalOz,
    goalAchieved,
    containerById,
  } = useAppState()

  const [pendingDelete, setPendingDelete] = useState<DrinkEntry | null>(null)

  const groups = groupByDay(entriesNewestFirst)

  return (
    <div className="screen">
      <header className="nav">
        <h1 className="nav__title">Summary</h1>
      </header>

      <div className="screen__scroll">
        {todaysEntries.length === 0 ? (
          <div className="empty">
            <span style={{ color: 'var(--water)', opacity: 0.8 }}>
              <Icon name="drop.circle" size={48} />
            </span>
            <h2 className="empty__title">No data for today</h2>
            <p className="empty__body">
              Start tracking your hydration by adding your first drink!
            </p>
            <button type="button" className="btn" onClick={onAddDrink}>
              <Icon name="plus" size={16} />
              Add First Drink
            </button>
          </div>
        ) : (
          <section className="card">
            <div className="spread">
              <strong>{dayFormatter.format(new Date())}</strong>
              {goalAchieved && (
                <span style={{ color: 'var(--sage)', display: 'inline-flex' }}>
                  <Icon name="checkmark.circle.fill" label="Goal met" />
                </span>
              )}
            </div>
            <div className="spread" style={{ alignItems: 'baseline', marginTop: 4 }}>
              <span>
                <strong style={{ fontSize: 22 }}>{oz(totalTodayOz)} oz</strong>{' '}
                <span className="muted" style={{ fontSize: 15 }}>/ {ozWhole(dailyGoalOz)} oz</span>
              </span>
              <span className="muted" style={{ fontSize: 12 }}>
                {todaysEntries.length} drinks
              </span>
            </div>
            <div style={{ marginTop: 10 }}>
              <Meter
                value={totalTodayOz}
                total={dailyGoalOz}
                slim
                color={goalAchieved ? 'var(--sage)' : 'var(--water)'}
              />
            </div>
          </section>
        )}

        <div className="spread" style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 22 }}>Recent Entries</h2>
          <button type="button" className="icon-btn" onClick={onAddDrink} aria-label="Add Drink">
            <Icon name="plus.circle.fill" size={26} />
          </button>
        </div>

        {entriesNewestFirst.length === 0 ? (
          <div className="empty" style={{ marginTop: 8 }}>
            <span className="muted" style={{ opacity: 0.6 }}>
              <Icon name="list.bullet.circle" size={48} />
            </span>
            <h3 className="empty__title">No entries yet</h3>
            <p className="empty__body">
              Your drink entries will appear here once you start logging.
            </p>
          </div>
        ) : (
          groups.map(([title, entries]) => (
            <section className="section" key={title}>
              <h3 className="section__title">{title}</h3>
              <ul className="section__body" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {entries.map((entry) => (
                  <li className="row" key={entry.id}>
                    <div style={{ minWidth: 0 }}>
                      <div className="spread" style={{ gap: 8, justifyContent: 'flex-start' }}>
                        <strong>{oz(entry.volume)} oz</strong>
                        <span className="tag">{entry.drinkType}</span>
                      </div>
                      <span className="row__sub">
                        {timeFormatter.format(new Date(entry.timestamp))}
                        {entry.containerId &&
                          ` · ${containerById(entry.containerId)?.name ?? 'Unknown'}`}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="icon-btn"
                      style={{ color: 'var(--rust)' }}
                      onClick={() => setPendingDelete(entry)}
                      aria-label={`Delete ${oz(entry.volume)} oz entry`}
                    >
                      <Icon name="trash" size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}

        {data.drinkEntries.length > 0 && <div style={{ height: 8 }} />}
      </div>

      {pendingDelete && (
        <Confirm
          title="Delete this entry?"
          message={`${oz(pendingDelete.volume)} oz logged at ${timeFormatter.format(new Date(pendingDelete.timestamp))}.`}
          onConfirm={() => {
            dispatch({ type: 'deleteEntries', ids: [pendingDelete.id] })
            setPendingDelete(null)
          }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}

/** Newest day first, newest entry first inside each day. */
function groupByDay(entries: DrinkEntry[]): Array<[string, DrinkEntry[]]> {
  const buckets = new Map<number, DrinkEntry[]>()

  for (const entry of entries) {
    const key = dayIndex(new Date(entry.timestamp))
    const bucket = buckets.get(key)
    if (bucket) bucket.push(entry)
    else buckets.set(key, [entry])
  }

  return [...buckets.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([, group]) => {
      const date = new Date(group[0].timestamp)
      const title = isToday(date) ? 'Today' : isYesterday(date) ? 'Yesterday' : dayFormatter.format(date)
      return [title, group] as [string, DrinkEntry[]]
    })
}
