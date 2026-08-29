import { useEffect, useId, useRef, useState } from 'react'
import type { BuddyStage } from '../domain/buddyEngine'
import { bodyTint, displayName } from '../domain/buddyStage'
import { clamped } from '../domain/clamp'
import './BuddyCharacter.css'

/** The buddy, drawn with shapes: droplet body, water fill at the day's progress,
 *  and a face that mirrors real dehydration severity. A direct port of
 *  `BuddyCharacterView.swift` — the geometry below is the same unit-space maths,
 *  evaluated once into a 100 × 118 viewBox (the 0.85 aspect ratio the SwiftUI
 *  view pins itself to).
 *
 *  `animated={false}` renders a static frame. */

const W = 100
const H = 118

// Droplet: pointed crown, round belly. Cubic out to the right shoulder, a
// half-circle belly, then the mirrored cubic back to the tip.
const DROPLET =
  'M50 2.36 C60 23.6 86 49.56 86 73.16 A36 36 0 0 1 14 73.16 C14 49.56 40 23.6 50 2.36 Z'

/** The water inside the buddy: a rolling surface at `level` (0 = empty, 1 = full).
 *  Drawn two periods wide so a CSS translate can carry it sideways forever —
 *  the web stand-in for animating `WaterWaveShape.phase`. */
function wavePath(level: number): string {
  const surfaceY = H * (1 - clamped(level, 0, 1))
  const amplitude = H * 0.015
  const steps = 48
  const points: string[] = [`M0 ${surfaceY.toFixed(2)}`]
  for (let i = 0; i <= steps; i++) {
    const x = (W * 2 * i) / steps
    const y = surfaceY + Math.sin((x / W) * Math.PI * 2) * amplitude
    points.push(`L${x.toFixed(2)} ${y.toFixed(2)}`)
  }
  points.push(`L${W * 2} ${H}`, `L0 ${H}`, 'Z')
  return points.join(' ')
}

/** An arc across a circle of radius `r` centred on the mouth, between two
 *  SwiftUI `trim` fractions (0 = 3 o'clock, increasing clockwise). */
function trimArc(from: number, to: number, r: number, close: boolean): string {
  const point = (t: number) => {
    const angle = t * Math.PI * 2
    return [r * Math.cos(angle), r * Math.sin(angle)] as const
  }
  const [x1, y1] = point(from)
  const [x2, y2] = point(to)
  const largeArc = to - from > 0.5 ? 1 : 0
  const d = `M${x1.toFixed(2)} ${y1.toFixed(2)} A${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`
  return close ? `${d} Z` : d
}

/** Uneasy wavy mouth for the wilting stage, in a 14.4 × 3 box centred on origin. */
const WOBBLE = 'M-7.2 0 C-5.04 -1.5 -2.88 1.5 0 0 C2.88 -1.5 5.04 1.5 7.2 0'

/** A short lightning-ish crack line, drawn in a unit box then scaled. */
function crackPath(w: number, h: number): string {
  return `M0 ${(h * 0.2).toFixed(2)} L${(w * 0.4).toFixed(2)} ${(h * 0.45).toFixed(2)} L${(w * 0.3).toFixed(2)} ${(h * 0.7).toFixed(2)} L${(w * 0.8).toFixed(2)} ${h.toFixed(2)}`
}

const SPARKLE = 'M0 -1 L0.26 -0.26 L1 0 L0.26 0.26 L0 1 L-0.26 0.26 L-1 0 L-0.26 -0.26 Z'

const INK = 'var(--ink)'
const STROKE = 2
const EYE_W = 8.5
const EYE_H = 8.85
const EYE_Y = H * 0.52
const EYE_X = W * 0.15
const MOUTH_Y = H * 0.67

interface BuddyCharacterProps {
  stage: BuddyStage
  fillFraction: number
  animated?: boolean
  onTap?: () => void
}

export function BuddyCharacter({
  stage,
  fillFraction,
  animated = true,
  onTap,
}: BuddyCharacterProps) {
  const id = useId()
  const clipId = `${id}-clip`
  const gradientId = `${id}-gradient`
  const [squishing, setSquishing] = useState(false)
  const squishTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(squishTimer.current), [])

  const droopy = stage === 'wilting' || stage === 'critical'
  const tint = bodyTint(stage)
  const level = clamped(fillFraction, 0, 1)
  const percent = Math.round(level * 100)

  const handleTap = () => {
    if (!animated) return
    setSquishing(true)
    window.clearTimeout(squishTimer.current)
    squishTimer.current = window.setTimeout(() => setSquishing(false), 250)
    onTap?.()
  }

  const interactive = animated && onTap != null

  return (
    <svg
      className={[
        'buddy',
        animated ? 'buddy--animated' : '',
        droopy ? 'buddy--droopy' : '',
        squishing ? 'buddy--squish' : '',
        interactive ? 'buddy--interactive' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Water buddy, ${displayName[stage]}, ${percent} percent of today's goal`}
      onClick={interactive ? handleTap : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                handleTap()
              }
            }
          : undefined
      }
      tabIndex={interactive ? 0 : undefined}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={DROPLET} />
        </clipPath>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tint.color} stopOpacity={0.55 * tint.opacity} />
          <stop offset="100%" stopColor={tint.color} stopOpacity={0.85 * tint.opacity} />
        </linearGradient>
      </defs>

      {/* Grounding shadow, counter-scaling the bob. */}
      <ellipse
        className="buddy__shadow"
        cx={W * 0.5}
        cy={H * 0.985}
        rx={W * 0.275}
        ry={H * 0.025}
        fill={INK}
        fillOpacity={0.12}
      />

      <g className="buddy__body">
       <g className="buddy__tilt">
        <g className="buddy__squish">
        {/* MARK: Body */}
        <path d={DROPLET} fill={`url(#${gradientId})`} />

        {/* The literal fill level: today's progress as water inside the buddy. */}
        <g clipPath={`url(#${clipId})`}>
          <g className="buddy__wave">
            <path d={wavePath(level * 0.92)} fill={tint.color} fillOpacity={tint.opacity} />
          </g>
        </g>

        <path d={DROPLET} fill="none" stroke={INK} strokeOpacity={0.35} strokeWidth={1.5} />

        {/* Sheen highlight. */}
        <ellipse
          cx={0}
          cy={0}
          rx={W * 0.05}
          ry={H * 0.08}
          fill="#fff"
          fillOpacity={stage === 'critical' ? 0.1 : 0.28}
          transform={`translate(${W * 0.3} ${H * 0.4}) rotate(18)`}
        />

        {/* MARK: Face */}
        <g transform={`translate(${W * 0.5 - EYE_X} ${EYE_Y})`}>
          <Eye stage={stage} />
        </g>
        <g transform={`translate(${W * 0.5 + EYE_X} ${EYE_Y})`}>
          <Eye stage={stage} />
        </g>

        {(stage === 'thriving' || stage === 'happy') && (
          <>
            <circle cx={W * 0.25} cy={H * 0.6} r={W * 0.045} fill="var(--terracotta)" fillOpacity={0.35} />
            <circle cx={W * 0.75} cy={H * 0.6} r={W * 0.045} fill="var(--terracotta)" fillOpacity={0.35} />
          </>
        )}

        <g transform={`translate(${W * 0.5} ${MOUTH_Y})`}>
          <Mouth stage={stage} />
        </g>

        {/* MARK: Decorations */}
        <Decorations stage={stage} clipId={clipId} />
        </g>
       </g>
      </g>
    </svg>
  )
}

function Eye({ stage }: { stage: BuddyStage }) {
  switch (stage) {
    case 'critical':
      // X eyes.
      return (
        <g className="buddy__eye" fill={INK}>
          <rect x={-EYE_W * 0.6} y={-EYE_W * 0.14} width={EYE_W * 1.2} height={EYE_W * 0.28} rx={EYE_W * 0.14} transform="rotate(45)" />
          <rect x={-EYE_W * 0.6} y={-EYE_W * 0.14} width={EYE_W * 1.2} height={EYE_W * 0.28} rx={EYE_W * 0.14} transform="rotate(-45)" />
        </g>
      )
    case 'wilting':
      // Heavy, half-shut lids.
      return (
        <g className="buddy__eye">
          <rect
            x={-EYE_W / 2}
            y={(-EYE_H * 0.35) / 2}
            width={EYE_W}
            height={EYE_H * 0.35}
            rx={(EYE_H * 0.35) / 2}
            fill={INK}
          />
        </g>
      )
    case 'thirsty':
    case 'parched':
      return (
        <g className="buddy__eye">
          <ellipse rx={EYE_W / 2} ry={(EYE_H * 0.6) / 2} fill={INK} />
        </g>
      )
    default:
      return (
        <g className="buddy__eye">
          <ellipse rx={EYE_W / 2} ry={EYE_H / 2} fill={INK} />
          <circle
            cx={-EYE_W * 0.15}
            cy={-EYE_H * 0.22}
            r={EYE_W * 0.15}
            fill="#fff"
            fillOpacity={0.9}
          />
        </g>
      )
  }
}

function Mouth({ stage }: { stage: BuddyStage }) {
  const mouthW = W * 0.18
  const stroked = {
    fill: 'none',
    stroke: INK,
    strokeWidth: STROKE,
    strokeLinecap: 'round' as const,
  }

  switch (stage) {
    case 'thriving':
      // Big open smile.
      return <path d={trimArc(0.05, 0.45, (mouthW * 1.2) / 2, true)} fill={INK} />
    case 'happy':
      return <path d={trimArc(0.1, 0.4, mouthW / 2, false)} {...stroked} />
    case 'content':
      return <path d={trimArc(0.15, 0.35, (mouthW * 0.8) / 2, false)} {...stroked} />
    case 'thirsty':
      return (
        <rect
          x={-(mouthW * 0.6) / 2}
          y={-STROKE / 2}
          width={mouthW * 0.6}
          height={STROKE}
          rx={STROKE / 2}
          fill={INK}
        />
      )
    case 'parched':
      // Frown: bottom arc flipped up.
      return (
        <path
          d={trimArc(0.6, 0.9, (mouthW * 0.8) / 2, false)}
          transform={`translate(0 ${mouthW * 0.3})`}
          {...stroked}
        />
      )
    case 'wilting':
      return <path d={WOBBLE} {...stroked} />
    case 'critical':
      return <circle r={(mouthW * 0.35) / 2} {...stroked} />
  }
}

function Decorations({ stage, clipId }: { stage: BuddyStage; clipId: string }) {
  switch (stage) {
    case 'thriving':
      return (
        <g fill="var(--gold)">
          <path d={SPARKLE} transform={`translate(${W * 0.13} ${H * 0.28}) scale(${W * 0.035})`} />
          <path d={SPARKLE} transform={`translate(${W * 0.88} ${H * 0.38}) scale(${W * 0.025})`} />
          <path d={SPARKLE} transform={`translate(${W * 0.2} ${H * 0.75}) scale(${W * 0.0225})`} />
        </g>
      )
    case 'thirsty':
    case 'parched':
      // A worried sweat bead — ironically, the last of the reserves.
      return (
        <path
          d={DROPLET}
          fill="var(--water)"
          fillOpacity={0.8}
          transform={`translate(${W * 0.8} ${H * 0.42}) scale(${(W * 0.06) / W} ${(W * 0.085) / H}) translate(${-W / 2} ${-H / 2})`}
        />
      )
    case 'wilting':
    case 'critical':
      // Dry cracks on the belly. Clipped to the droplet so a crack that reaches
      // the silhouette stops at it rather than hanging off the edge.
      return (
        <g
          clipPath={`url(#${clipId})`}
          fill="none"
          stroke={INK}
          strokeOpacity={0.45}
          strokeWidth={1.5}
          strokeLinecap="round"
        >
          <path d={crackPath(W * 0.14, H * 0.08)} transform={`translate(${W * 0.26 - W * 0.07} ${H * 0.78 - H * 0.04})`} />
          <path d={crackPath(W * 0.1, H * 0.06)} transform={`translate(${W * 0.74 + W * 0.05} ${H * 0.84 - H * 0.03}) scale(-1 1)`} />
        </g>
      )
    default:
      return null
  }
}
