import type { BuddyStage } from './buddyEngine'
import { dayIndex } from './dates'

/** One educational blurb shown on the Buddy tab, tagged with the stages it suits. */
export interface HydrationFact {
  id: string
  text: string
  /** Short attribution shown under the fact (clinical or peer-reviewed source). */
  source: string
  stages: BuddyStage[]
}

/** Verified hydration facts, each anchored to a clinical or peer-reviewed source.
 *  Severity bands (~1–2% / 3–5% / >5% body-water loss) are approximate teaching
 *  ranges from the literature, not hard clinical cutoffs.
 *
 *  Research backing lives in the iOS repo at `docs/hydration-facts.md`. */
export const HYDRATION_FACTS: HydrationFact[] = [
  // Healthy-state fun facts
  {
    id: 'body-water',
    text: 'Up to about 60% of the adult body is water — and the brain is roughly 75% water.',
    source: 'Cleveland Clinic',
    stages: ['thriving', 'happy'],
  },
  {
    id: 'mood-memory',
    text: 'Good hydration supports processing speed, working memory, and mood.',
    source: 'Water supplementation RCT, PMC',
    stages: ['thriving', 'happy'],
  },
  {
    id: 'skin',
    text: 'Staying hydrated helps skin stay moist and elastic; dehydration leaves it drier and less springy.',
    source: 'Healthline',
    stages: ['thriving', 'happy'],
  },
  {
    id: 'food-counts',
    text: 'A lot of your daily water arrives through food and other beverages — not just plain water.',
    source: 'McGill Office for Science and Society',
    stages: ['thriving', 'happy', 'content'],
  },

  // Mild (~1–2% body-water loss)
  {
    id: 'thirst-lags',
    text: "Feeling thirsty means you're already about 1–2% down on body water — the effects start before the feeling does.",
    source: 'British Journal of Nutrition',
    stages: ['content', 'thirsty'],
  },
  {
    id: 'concentration',
    text: 'At just 1–2% down, concentration is the mental skill that slips first, often with a mild headache and dip in mood.',
    source: 'British Journal of Nutrition',
    stages: ['thirsty'],
  },
  {
    id: 'urine-check',
    text: 'Darker urine is one of the earliest reliable signs of dehydration — pale is the goal.',
    source: 'Cleveland Clinic',
    stages: ['content', 'thirsty'],
  },

  // Moderate (~3–5%)
  {
    id: 'performance',
    text: 'Around 3% body-water loss, studies measure muscle endurance down ~8% and strength down ~5%.',
    source: 'Human Kinetics',
    stages: ['parched'],
  },
  {
    id: 'dizzy',
    text: 'Moderate dehydration brings dry mouth, tiredness, dizziness, and lightheadedness.',
    source: 'Cleveland Clinic',
    stages: ['parched'],
  },
  {
    id: 'heat',
    text: 'Dehydration hits hardest in heat — sweating can cost 1–3 liters an hour during hard exercise.',
    source: 'German Journal of Sports Medicine',
    stages: ['parched', 'wilting'],
  },

  // Severe (>5–10%) — the honest, non-folklore version
  {
    id: 'severe-signs',
    text: 'Severe dehydration means a racing pulse with low blood pressure, confusion, and fainting — doctors treat it as an emergency.',
    source: 'Cleveland Clinic',
    stages: ['wilting', 'critical'],
  },
  {
    id: 'hallucination-truth',
    text: 'In extreme cases severe dehydration can cause confusion and even hallucinations — it tracks severity, not a fixed number of days.',
    source: 'Cleveland Clinic',
    stages: ['critical'],
  },
  {
    id: 'three-day-rule',
    text: 'The "3 days without water" figure is a survival rule of thumb — the realistic range runs from about 2 days in harsh heat to around a week in cool, restful conditions.',
    source: 'Medical News Today',
    stages: ['wilting', 'critical'],
  },

  // Myth-busters (sprinkled into healthier states)
  {
    id: 'eight-glasses',
    text: 'The "8 glasses a day" rule has no solid scientific basis — needs vary with body size, activity, diet, and climate.',
    source: 'Center for Inquiry; McGill OSS',
    stages: ['thriving', 'happy', 'content'],
  },
  {
    id: 'caffeine-myth',
    text: 'Coffee and tea count toward your fluids — the diuretic effect of moderate caffeine is mild, and regular drinkers adapt.',
    source: 'NPR Life Kit',
    stages: ['thriving', 'happy', 'content'],
  },
]

/** Deterministic pick for a stage: rotates daily, and `offset` lets the UI page
 *  through on tap. Always returns a fact — every stage has at least one. */
export function factFor(
  stage: BuddyStage,
  on: Date = new Date(),
  offset = 0,
): HydrationFact {
  const pool = HYDRATION_FACTS.filter((fact) => fact.stages.includes(stage))
  if (pool.length === 0) return HYDRATION_FACTS[0]
  // Day-of-era in Swift; days-since-epoch here. Both are a monotonically
  // increasing day counter, which is all the rotation needs.
  const day = dayIndex(on)
  return pool[(((day + offset) % pool.length) + pool.length) % pool.length]
}
