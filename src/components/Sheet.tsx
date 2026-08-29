import { useEffect, useRef, type ReactNode } from 'react'
import { Icon } from './Icon'

/** A modal sheet, standing in for SwiftUI's `.sheet` presentation: dismisses on
 *  Escape or a backdrop click, and traps initial focus inside the panel. */
export function Sheet({
  title,
  onClose,
  children,
  leading,
  trailing,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  /** Replaces the default "Cancel" button. */
  leading?: ReactNode
  /** The confirming action, e.g. "Save". */
  trailing?: ReactNode
}) {
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [onClose])

  return (
    <div className="sheet-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={panel}
      >
        <div className="sheet__bar">
          {leading ?? (
            <button type="button" className="btn btn--plain" onClick={onClose}>
              Cancel
            </button>
          )}
          <span className="sheet__title">{title}</span>
          {trailing ?? (
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
              <Icon name="xmark" />
            </button>
          )}
        </div>
        <div className="sheet__body">{children}</div>
      </div>
    </div>
  )
}
