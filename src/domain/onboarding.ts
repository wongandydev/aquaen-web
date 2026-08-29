export const DEFAULT_CONTAINERS = [
  { name: 'Water Bottle', volumeOz: 16 },
  { name: 'Glass of Water', volumeOz: 8 },
  { name: 'Large Cup', volumeOz: 12 },
] as const

export type ActivityLevel = 'low' | 'moderate' | 'high'

export const ACTIVITY_LEVELS: ActivityLevel[] = ['low', 'moderate', 'high']

export const activityLabel: Record<ActivityLevel, string> = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
}

export const activityDescription: Record<ActivityLevel, string> = {
  low: 'Minimal exercise, desk job',
  moderate: 'Regular exercise 3-4x/week',
  high: 'Daily exercise, active lifestyle',
}

/** Weight in pounds; `null` falls back to the 64 oz default. */
export function recommendedDailyGoal(
  weight: number | null,
  activityLevel: ActivityLevel,
): number {
  const baseOz = weight != null ? weight * 0.67 : 64

  switch (activityLevel) {
    case 'low': return baseOz
    case 'moderate': return baseOz * 1.2
    case 'high': return baseOz * 1.5
  }
}

export type OnboardingStep = 'welcome' | 'goalSetup' | 'containerSetup'

export const stepTitle: Record<OnboardingStep, string> = {
  welcome: 'Welcome',
  goalSetup: 'Set Your Goal',
  containerSetup: 'Choose Containers',
}
