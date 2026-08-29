/** The persisted shapes. These mirror the Core Data entities in the iOS app
 *  (`Container`, `DrinkEntry`, `UserSettings`) minus the object graph — on the
 *  web everything lives in one JSON document in localStorage, so relationships
 *  are plain id references. */

export interface Container {
  id: string
  name: string
  volumeOz: number
}

export interface DrinkEntry {
  id: string
  volume: number
  drinkType: DrinkType
  /** ISO-8601. Stored as a string so the state round-trips through JSON. */
  timestamp: string
  /** `null` when logged as a custom volume rather than from a saved container. */
  containerId: string | null
}

export const DRINK_TYPES = ['water', 'coffee', 'tea', 'juice', 'soda', 'other'] as const
export type DrinkType = (typeof DRINK_TYPES)[number]

export interface UserSettings {
  dailyGoalOz: number
  reminderEnabled: boolean
  reminderIntervalHours: number
  defaultContainerId: string | null
  buddyName: string
}

export interface AppData {
  /** Bumped when the persisted shape changes; see `store/storage.ts`. */
  schemaVersion: number
  hasCompletedOnboarding: boolean
  containers: Container[]
  drinkEntries: DrinkEntry[]
  settings: UserSettings
}

/** Goals outside this range are nonsensical (negative goals break the progress
 *  bar; 500+ oz is roughly twice the maximum survivable daily water intake). */
export const DAILY_GOAL_RANGE = { min: 1, max: 500 } as const

/** A single logged drink outside this range is nonsensical: 0/negative can't be
 *  logged, and 500 oz already exceeds the maximum sane daily goal. */
export const ENTRY_VOLUME_RANGE = { min: 1, max: 500 } as const

export const DEFAULT_SETTINGS: UserSettings = {
  dailyGoalOz: 64,
  reminderEnabled: true,
  reminderIntervalHours: 2,
  defaultContainerId: null,
  buddyName: '',
}
