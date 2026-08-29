/** Inline icon set standing in for the SF Symbols the iOS app uses. Names match
 *  the SF Symbol they replace so the two codebases stay easy to diff. Everything
 *  is drawn in a 24×24 box and inherits `currentColor`. */

export type IconName =
  | 'drop.fill'
  | 'drop.circle'
  | 'plus'
  | 'plus.circle.fill'
  | 'chart.bar.fill'
  | 'gear'
  | 'target'
  | 'cup.and.saucer.fill'
  | 'bell.badge'
  | 'checkmark.circle.fill'
  | 'checkmark.seal.fill'
  | 'book.closed.fill'
  | 'sparkle'
  | 'envelope'
  | 'chevron.right'
  | 'chevron.left'
  | 'circle'
  | 'trash'
  | 'pencil'
  | 'xmark'
  | 'list.bullet.circle'

const DROP = 'M12 2.5c2.4 4.2 6.5 7.4 6.5 11a6.5 6.5 0 0 1-13 0c0-3.6 4.1-6.8 6.5-11Z'

/** Checkmark drawn as a closed outline so it can be punched out of a filled disc. */
const CHECK = 'M7.0 12.3 8.4 10.9 10.9 13.4 15.6 8.0 17.0 9.2 11.0 16.1Z'

const PATHS: Record<IconName, { d: string; fill?: boolean; evenOdd?: boolean }[]> = {
  'drop.fill': [{ d: DROP, fill: true }],
  'drop.circle': [
    { d: 'M12 21.5a9.5 9.5 0 1 0 0-19 9.5 9.5 0 0 0 0 19Z' },
    { d: 'M12 6.5c1.5 2.6 4 4.6 4 6.8a4 4 0 0 1-8 0c0-2.2 2.5-4.2 4-6.8Z' },
  ],
  plus: [{ d: 'M12 5v14M5 12h14' }],
  'plus.circle.fill': [
    {
      d: 'M12 21.5a9.5 9.5 0 1 0 0-19 9.5 9.5 0 0 0 0 19Z M10.6 7.6h2.8v3h3v2.8h-3v3h-2.8v-3h-3v-2.8h3Z',
      fill: true,
      evenOdd: true,
    },
  ],
  'chart.bar.fill': [
    { d: 'M4 20h3V10H4v10Zm6.5 0h3V4h-3v16ZM17 20h3v-7h-3v7Z', fill: true },
  ],
  gear: [
    { d: 'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z' },
    {
      d: 'M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a1.9 1.9 0 1 1-2.7 2.7l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a1.9 1.9 0 1 1-3.8 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a1.9 1.9 0 1 1-2.7-2.7l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3.5a1.9 1.9 0 1 1 0-3.8h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a1.9 1.9 0 1 1 2.7-2.7l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5V3.5a1.9 1.9 0 1 1 3.8 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a1.9 1.9 0 1 1 2.7 2.7l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1h.2a1.9 1.9 0 1 1 0 3.8h-.1a1.6 1.6 0 0 0-1.5 1Z',
    },
  ],
  target: [
    { d: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z' },
    { d: 'M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z' },
    { d: 'M12 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z', fill: true },
  ],
  'cup.and.saucer.fill': [
    { d: 'M4 5h12v6a6 6 0 0 1-12 0V5Z', fill: true },
    { d: 'M16 6.5h1.8a2.7 2.7 0 0 1 0 5.4H16' },
    { d: 'M3 19h18' },
  ],
  'bell.badge': [
    { d: 'M18 9.5a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16s-2-1.5-2-6.5Z' },
    { d: 'M10.3 19.5a2 2 0 0 0 3.4 0' },
    { d: 'M18.5 6.5a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z', fill: true },
  ],
  'checkmark.circle.fill': [
    { d: `M12 21.5a9.5 9.5 0 1 0 0-19 9.5 9.5 0 0 0 0 19Z ${CHECK}`, fill: true, evenOdd: true },
  ],
  'checkmark.seal.fill': [
    {
      d: `M12 2.2 14 4l2.6-.4 1 2.5 2.4 1.2-.7 2.6.7 2.6-2.4 1.2-1 2.5L14 15.8 12 17.6 10 15.8l-2.6.4-1-2.5-2.4-1.2.7-2.6-.7-2.6 2.4-1.2 1-2.5L10 4l2-1.8Z ${CHECK}`,
      fill: true,
      evenOdd: true,
    },
  ],
  'book.closed.fill': [
    { d: 'M5 4.5A2.5 2.5 0 0 1 7.5 2H18a1 1 0 0 1 1 1v17a1 1 0 0 1-1 1H7.5A2.5 2.5 0 0 1 5 18.5v-14Z', fill: true },
  ],
  sparkle: [{ d: 'M12 2.5 13.7 9l6.3 1.7L13.7 12.4 12 19l-1.7-6.6L4 10.7 10.3 9 12 2.5Z', fill: true }],
  envelope: [
    { d: 'M3.5 6.5h17v11h-17v-11Z' },
    { d: 'm3.5 7.5 8.5 6 8.5-6' },
  ],
  'chevron.right': [{ d: 'm9.5 5 7 7-7 7' }],
  'chevron.left': [{ d: 'm14.5 5-7 7 7 7' }],
  circle: [{ d: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z' }],
  trash: [
    { d: 'M4.5 6.5h15' },
    { d: 'M9.5 6.5V4.2h5v2.3' },
    { d: 'M6.5 6.5 7.4 20a1 1 0 0 0 1 .9h7.2a1 1 0 0 0 1-.9l.9-13.5' },
  ],
  pencil: [
    { d: 'M4 20h4l10-10a2.8 2.8 0 0 0-4-4L4 16v4Z' },
    { d: 'm13.5 6.5 4 4' },
  ],
  xmark: [{ d: 'm6 6 12 12M18 6 6 18' }],
  'list.bullet.circle': [
    { d: 'M12 21.5a9.5 9.5 0 1 0 0-19 9.5 9.5 0 0 0 0 19Z' },
    { d: 'M10.5 9.5h5M10.5 12.5h5M10.5 15.5h5' },
    { d: 'M8 9.5h.01M8 12.5h.01M8 15.5h.01' },
  ],
}

interface IconProps {
  name: IconName
  size?: number
  className?: string
  /** Decorative by default; pass a label to expose it to assistive tech. */
  label?: string
}

export function Icon({ name, size = 20, className, label }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role={label ? 'img' : 'presentation'}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {PATHS[name].map((path, i) => (
        <path
          key={i}
          d={path.d}
          fill={path.fill ? 'currentColor' : 'none'}
          fillRule={path.evenOdd ? 'evenodd' : undefined}
          stroke={path.evenOdd ? 'none' : 'currentColor'}
          strokeWidth={path.fill ? 0.9 : 1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}
