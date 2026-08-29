import type { BuddyStage } from './buddyEngine'

/** User-facing copy and styling for each buddy stage. Kept separate from
 *  `buddyEngine` so the derivation logic stays pure and presentation-free. */

export const displayName: Record<BuddyStage, string> = {
  thriving: 'Thriving',
  happy: 'Happy',
  content: 'Content',
  thirsty: 'Thirsty',
  parched: 'Parched',
  wilting: 'Wilting',
  critical: 'Critical',
}

/** Headline shown under the character. `name` is the buddy's (renamable) name. */
export function headline(stage: BuddyStage, name: string): string {
  switch (stage) {
    case 'thriving': return `${name} is thriving!`
    case 'happy': return `${name} is happy`
    case 'content': return `${name} is doing okay`
    case 'thirsty': return `${name} is getting thirsty`
    case 'parched': return `${name} is parched`
    case 'wilting': return `${name} is wilting…`
    case 'critical': return `${name} needs you!`
  }
}

/** What a real human would feel at this level of hydration — the educational hook.
 *  Severity-based, per clinical sources; deliberately never phrased as a countdown. */
export const humanNote: Record<BuddyStage, string> = {
  thriving:
    "Goal met! Fun fact: your brain is roughly 75% water — it's feeling this.",
  happy:
    'Nicely on pace. Staying ahead of thirst keeps focus and energy steady, since deficits start before you feel thirsty.',
  content:
    "A little behind. By the time you feel thirst, you're already about 1–2% down on body water.",
  thirsty:
    'At this level a person gets a mild headache, trouble concentrating, and darker urine — the first real signs of dehydration.',
  parched:
    'Moderate dehydration territory: dizziness, fatigue, and measurably weaker muscles. Time for a proper glass of water.',
  wilting:
    'A human this dehydrated would feel weak and lightheaded, with a racing heart — doctors treat severe dehydration as an emergency.',
  critical:
    'Days without water is life-threatening for a human — severe dehydration can cause confusion and, in extreme cases, hallucinations. Your buddy is hanging on!',
}

/** Short things the buddy "says" when tapped. */
export const quips: Record<BuddyStage, string[]> = {
  thriving: ['I feel amazing!', 'We did it today!', 'Peak droplet form 💪', 'Sparkling, literally.'],
  happy: ['Feeling good!', 'Nice and topped up.', "You're on a roll!", 'Keep it flowing!'],
  content: ['Doing alright!', 'A sip soon would be lovely.', 'Cruising along~'],
  thirsty: ['Getting a bit dry over here…', 'A glass of water would hit the spot.', 'My head aches a little…'],
  parched: ['Really thirsty…', 'Feeling dizzy…', 'Water… please?'],
  wilting: ['So… dry…', "I don't feel so good…", 'Help me out here…'],
  critical: ['…', '*faint gurgle*', 'Still… here…'],
}

export interface Tint {
  /** A CSS custom property reference from `styles/theme.css`. */
  color: string
  opacity: number
}

/** Body tint at this stage: plump dusty blue when healthy, drying toward
 *  beige-rust as things get dire. */
export function bodyTint(stage: BuddyStage): Tint {
  switch (stage) {
    case 'thriving':
    case 'happy': return { color: 'var(--water)', opacity: 1 }
    case 'content': return { color: 'var(--water)', opacity: 0.9 }
    case 'thirsty': return { color: 'var(--water)', opacity: 0.7 }
    case 'parched': return { color: 'var(--gold)', opacity: 0.55 }
    case 'wilting': return { color: 'var(--rust)', opacity: 0.5 }
    case 'critical': return { color: 'var(--faded-ink)', opacity: 0.5 }
  }
}

/** Accent used for the stage label and meter. */
export function labelColor(stage: BuddyStage): string {
  switch (stage) {
    case 'thriving': return 'var(--sage)'
    case 'happy':
    case 'content': return 'var(--water)'
    case 'thirsty': return 'var(--gold)'
    case 'parched': return 'var(--terracotta)'
    case 'wilting':
    case 'critical': return 'var(--rust)'
  }
}
