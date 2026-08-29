import { DEFAULT_SETTINGS, type AppData } from '../domain/types'

const STORAGE_KEY = 'aquaen.appData'
const SCHEMA_VERSION = 1

export function emptyData(): AppData {
  return {
    schemaVersion: SCHEMA_VERSION,
    hasCompletedOnboarding: false,
    containers: [],
    drinkEntries: [],
    settings: { ...DEFAULT_SETTINGS },
  }
}

/** Reads the saved document. Anything unreadable — corrupt JSON, a schema from
 *  the future, a browser that throws on `localStorage` — yields a fresh empty
 *  document rather than a blank screen. Mirrors the iOS store's "reset and carry
 *  on" recovery instead of crashing at launch. */
export function loadData(): AppData {
  let raw: string | null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return emptyData()
  }
  if (!raw) return emptyData()

  try {
    const parsed = JSON.parse(raw) as Partial<AppData>
    if (parsed.schemaVersion !== SCHEMA_VERSION) return emptyData()

    return {
      schemaVersion: SCHEMA_VERSION,
      hasCompletedOnboarding: Boolean(parsed.hasCompletedOnboarding),
      containers: Array.isArray(parsed.containers) ? parsed.containers : [],
      drinkEntries: Array.isArray(parsed.drinkEntries) ? parsed.drinkEntries : [],
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
    }
  } catch {
    return emptyData()
  }
}

/** Best-effort write. A full quota or a private-mode browser must not take the
 *  app down mid-log, so a failure here is swallowed — the in-memory state stays
 *  correct for the session. */
export function saveData(data: AppData): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* nothing useful to do; the session keeps working from memory */
  }
}

export function clearData(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
