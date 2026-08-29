import { useState } from 'react'
import { Confirm } from '../components/Confirm'
import { Icon } from '../components/Icon'
import { Sheet } from '../components/Sheet'
import { oz } from '../domain/format'
import type { Container } from '../domain/types'
import { useAppState } from '../store/AppState'

/** Port of `ContainerView.swift` + `AddContainerView` / `EditContainerView`.
 *  The free-tier container cap is gone: there are no purchases on the web, so
 *  everything the iOS paywall gated is simply available. */
export function Containers({ onBack }: { onBack: () => void }) {
  const { data, dispatch } = useAppState()
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<Container | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Container | null>(null)

  const defaultId = data.settings.defaultContainerId

  return (
    <div className="screen">
      <header className="nav">
        <div className="nav__actions">
          <button type="button" className="icon-btn" onClick={onBack} aria-label="Back to Settings">
            <Icon name="chevron.left" />
          </button>
          <h1 className="nav__title" style={{ fontSize: 22 }}>Containers</h1>
        </div>
        <button type="button" className="icon-btn" onClick={() => setAdding(true)} aria-label="Add Container">
          <Icon name="plus.circle.fill" size={26} />
        </button>
      </header>

      <div className="screen__scroll">
        {data.containers.length === 0 ? (
          <div className="empty">
            <span style={{ color: 'var(--water)', opacity: 0.8 }}>
              <Icon name="cup.and.saucer.fill" size={48} />
            </span>
            <h2 className="empty__title">No containers yet</h2>
            <p className="empty__body">
              Save the cups and bottles you use most, then log a drink with one tap.
            </p>
            <button type="button" className="btn" onClick={() => setAdding(true)}>
              <Icon name="plus" size={16} />
              Add Container
            </button>
          </div>
        ) : (
          <ul className="section__body" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {data.containers.map((container) => (
              <li className="row" key={container.id}>
                <div>
                  <span className="row__label">{container.name}</span>
                  <span className="row__sub">
                    {oz(container.volumeOz)} oz
                    {container.id === defaultId && ' · Default'}
                  </span>
                </div>
                <div style={{ display: 'flex' }}>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => setEditing(container)}
                    aria-label={`Edit ${container.name}`}
                  >
                    <Icon name="pencil" size={18} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    style={{ color: 'var(--rust)' }}
                    onClick={() => setPendingDelete(container)}
                    aria-label={`Delete ${container.name}`}
                  >
                    <Icon name="trash" size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {adding && <ContainerEditor onClose={() => setAdding(false)} />}
      {editing && <ContainerEditor container={editing} onClose={() => setEditing(null)} />}

      {pendingDelete && (
        <Confirm
          title={`Delete "${pendingDelete.name}"?`}
          message={
            pendingDelete.id === defaultId
              ? 'It is your default container — the next one on the list takes over.'
              : undefined
          }
          onConfirm={() => {
            dispatch({ type: 'deleteContainers', ids: [pendingDelete.id] })
            setPendingDelete(null)
          }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}

/** One sheet for both add and edit — the two iOS views differ only in whether
 *  they start from an existing container. */
function ContainerEditor({
  container,
  onClose,
}: {
  container?: Container
  onClose: () => void
}) {
  const { data, dispatch } = useAppState()
  const [name, setName] = useState(container?.name ?? '')
  const [volume, setVolume] = useState(String(container?.volumeOz ?? 8))
  const [isDefault, setIsDefault] = useState(
    container ? data.settings.defaultContainerId === container.id : false,
  )

  const volumeOz = Number(volume)
  const canSave = name.trim().length > 0 && Number.isFinite(volumeOz) && volumeOz > 0

  const save = () => {
    if (!canSave) return
    if (container) {
      dispatch({ type: 'updateContainer', id: container.id, name, volumeOz })
      dispatch({
        type: 'updateSettings',
        patch: {
          defaultContainerId: isDefault
            ? container.id
            : data.settings.defaultContainerId === container.id
              ? null
              : data.settings.defaultContainerId,
        },
      })
    } else {
      dispatch({ type: 'addContainer', name, volumeOz, isDefault })
    }
    onClose()
  }

  return (
    <Sheet
      title={container ? 'Edit Container' : 'Add Container'}
      onClose={onClose}
      trailing={
        <button type="button" className="btn btn--plain" onClick={save} disabled={!canSave}>
          Save
        </button>
      }
    >
      <div className="section" style={{ marginTop: 8 }}>
        <h2 className="section__title">Container Details</h2>
        <div className="section__body">
          <label className="row">
            <span className="row__label">Name</span>
            <input
              className="input"
              style={{ width: 200 }}
              value={name}
              placeholder="Water Bottle"
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </label>
          <label className="row">
            <span className="row__label">Volume (oz)</span>
            <input
              className="input input--inline"
              type="number"
              inputMode="decimal"
              min="0.5"
              step="0.5"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
            />
          </label>
          <label className="row">
            <span className="row__label">Set as Default</span>
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              style={{ width: 20, height: 20 }}
            />
          </label>
        </div>
      </div>
    </Sheet>
  )
}
