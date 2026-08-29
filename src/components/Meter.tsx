import { clamped } from '../domain/clamp'

export function Meter({
  value,
  total,
  color,
  slim = false,
  label,
}: {
  value: number
  total: number
  color: string
  slim?: boolean
  label?: string
}) {
  const fraction = total > 0 ? clamped(value / total, 0, 1) : 0
  return (
    <div
      className={`meter ${slim ? 'meter--slim' : ''}`}
      role="progressbar"
      aria-valuenow={Math.round(fraction * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? 'Progress toward daily goal'}
    >
      <div
        className="meter__fill"
        style={{ width: `${fraction * 100}%`, background: color }}
      />
    </div>
  )
}
