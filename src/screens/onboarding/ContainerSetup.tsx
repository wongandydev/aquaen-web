import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { ozWhole } from '../../domain/format'
import { DEFAULT_CONTAINERS } from '../../domain/onboarding'

/** Port of `ContainerSetupView.swift`. */
export function ContainerSetup({
  onContinue,
}: {
  onContinue: (containers: Array<{ name: string; volumeOz: number }>) => void
}) {
  const [selected, setSelected] = useState<Set<number>>(() => new Set([0, 1]))

  const toggle = (index: number) => {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <div className="screen">
      <div className="screen__scroll" style={{ paddingTop: 24 }}>
        <div className="stack" style={{ gap: 32 }}>
          <div className="center" style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
            <span style={{ color: 'var(--water)' }}>
              <Icon name="cup.and.saucer.fill" size={60} />
            </span>
            <h1 className="serif" style={{ fontSize: 28 }}>Choose Your Containers</h1>
            <p className="muted" style={{ margin: 0 }}>Select the containers you use most often</p>
          </div>

          <div className="stack--tight" style={{ display: 'grid', gap: 12 }}>
            {DEFAULT_CONTAINERS.map((container, index) => (
              <button
                key={container.name}
                type="button"
                className="option-row"
                aria-pressed={selected.has(index)}
                onClick={() => toggle(index)}
              >
                <span>
                  <strong>{container.name}</strong>
                  <span className="row__sub">{ozWhole(container.volumeOz)} oz</span>
                </span>
                <span
                  style={{
                    color: selected.has(index) ? 'var(--terracotta)' : 'var(--faded-ink)',
                    display: 'inline-flex',
                  }}
                >
                  <Icon name={selected.has(index) ? 'checkmark.circle.fill' : 'circle'} size={24} />
                </span>
              </button>
            ))}

            <div className="highlight center" style={{ display: 'grid', gap: 4 }}>
              <strong>💡 Tip</strong>
              <span className="hint">
                You can add more containers or edit these later in Settings
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 32px 20px', display: 'grid', gap: 12 }}>
        {selected.size === 0 && (
          <p className="hint center" style={{ margin: 0 }}>
            Select at least one container to continue
          </p>
        )}
        <button
          type="button"
          className="btn btn--block"
          disabled={selected.size === 0}
          onClick={() => onContinue([...selected].sort().map((i) => ({ ...DEFAULT_CONTAINERS[i] })))}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
