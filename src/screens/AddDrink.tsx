import { useState } from 'react'
import { Sheet } from '../components/Sheet'
import { DRINK_TYPES, ENTRY_VOLUME_RANGE, type DrinkType } from '../domain/types'
import { clamped } from '../domain/clamp'
import { capitalize, oz, ozWhole } from '../domain/format'
import { useAppState } from '../store/AppState'

/** Port of `AddDrinkView.swift`. */
export function AddDrink({ onClose }: { onClose: () => void }) {
  const { data, dispatch, defaultContainer } = useAppState()
  const containers = data.containers

  const [containerId, setContainerId] = useState<string | null>(defaultContainer?.id ?? null)
  const [drinkType, setDrinkType] = useState<DrinkType>('water')
  const [volume, setVolume] = useState<string>(String(defaultContainer?.volumeOz ?? 8))
  /** Set to the clamped value when the entry falls outside the allowed range,
   *  which both presents the notice and says what will be logged on confirm. */
  const [adjustedVolume, setAdjustedVolume] = useState<number | null>(null)

  const selected = containers.find((c) => c.id === containerId)
  const requestedVolume = selected ? selected.volumeOz : Number(volume)
  const canSave = Number.isFinite(requestedVolume) && requestedVolume > 0

  const save = (amount: number) => {
    dispatch({ type: 'addDrink', volume: amount, drinkType, containerId })
    onClose()
  }

  const attemptSave = () => {
    if (!canSave) return
    const clamped_ = clamped(requestedVolume, ENTRY_VOLUME_RANGE.min, ENTRY_VOLUME_RANGE.max)

    // Never silently log something other than what the user typed. Surface the
    // adjustment and let them confirm on a second tap instead.
    if (clamped_ !== requestedVolume) {
      if (!selected) setVolume(String(clamped_))
      setAdjustedVolume(clamped_)
      return
    }
    save(clamped_)
  }

  return (
    <Sheet
      title="Add Drink"
      onClose={onClose}
      trailing={
        <button type="button" className="btn btn--plain" onClick={attemptSave} disabled={!canSave}>
          Save
        </button>
      }
    >
      <div className="section" style={{ marginTop: 8 }}>
        <h2 className="section__title">Drink Details</h2>
        <div className="section__body">
          <label className="row">
            <span className="row__label">Drink Type</span>
            <select
              className="select input--inline"
              style={{ width: 150 }}
              value={drinkType}
              onChange={(e) => setDrinkType(e.target.value as DrinkType)}
            >
              {DRINK_TYPES.map((type) => (
                <option key={type} value={type}>{capitalize(type)}</option>
              ))}
            </select>
          </label>

          <label className="row">
            <span className="row__label">Container</span>
            <select
              className="select select--inline"
              value={containerId ?? ''}
              onChange={(e) => {
                const next = e.target.value || null
                setContainerId(next)
                const container = containers.find((c) => c.id === next)
                if (container) setVolume(String(container.volumeOz))
              }}
            >
              <option value="">Other (Custom Volume)</option>
              {containers.map((container) => (
                <option key={container.id} value={container.id}>
                  {container.name} ({oz(container.volumeOz)} oz)
                </option>
              ))}
            </select>
          </label>

          {selected ? (
            <div className="row">
              <span className="row__label">Volume (oz)</span>
              <span className="row__value">{oz(selected.volumeOz)}</span>
            </div>
          ) : (
            <label className="row">
              <span className="row__label">Volume (oz)</span>
              <input
                className="input input--inline"
                type="number"
                inputMode="decimal"
                min={ENTRY_VOLUME_RANGE.min}
                max={ENTRY_VOLUME_RANGE.max}
                step="0.5"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
              />
            </label>
          )}
        </div>

        {containers.length === 0 && (
          <p className="hint" style={{ margin: '10px 4px 0' }}>
            No saved containers yet — add some from Settings → Manage Containers to log
            with one tap.
          </p>
        )}

        {adjustedVolume != null && (
          <div className="card" style={{ marginTop: 16 }}>
            <strong>Volume Adjusted</strong>
            <p className="hint" style={{ margin: '6px 0 12px' }}>
              A single drink must be between {ozWhole(ENTRY_VOLUME_RANGE.min)} and{' '}
              {ozWhole(ENTRY_VOLUME_RANGE.max)} oz. This entry will be logged as{' '}
              {oz(adjustedVolume)} oz.
            </p>
            <button type="button" className="btn" onClick={() => save(adjustedVolume)}>
              Log {oz(adjustedVolume)} oz
            </button>
          </div>
        )}
      </div>
    </Sheet>
  )
}
