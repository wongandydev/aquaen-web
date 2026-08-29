import { Sheet } from './Sheet'

/** The web stand-in for `.confirmationDialog` / destructive `.alert`. */
export function Confirm({
  title,
  message,
  confirmLabel = 'Delete',
  destructive = true,
  onConfirm,
  onCancel,
}: {
  title: string
  message?: string
  confirmLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Sheet
      title={title}
      onClose={onCancel}
      trailing={<span style={{ width: 44 }} />}
    >
      <div className="stack">
        {message && <p className="muted" style={{ margin: 0 }}>{message}</p>}
        <button
          type="button"
          className={`btn btn--block ${destructive ? 'btn--destructive' : ''}`}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
        <button type="button" className="btn btn--block btn--secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </Sheet>
  )
}
