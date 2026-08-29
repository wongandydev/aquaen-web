import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react'
import {
  DAILY_GOAL_RANGE,
  ENTRY_VOLUME_RANGE,
  type AppData,
  type Container,
  type DrinkEntry,
  type DrinkType,
  type UserSettings,
} from '../domain/types'
import { clamped } from '../domain/clamp'
import { isToday } from '../domain/dates'
import { emptyData, loadData, newId, saveData } from './storage'

// MARK: - Actions

type Action =
  | { type: 'completeOnboarding'; dailyGoalOz: number; containers: Array<{ name: string; volumeOz: number }> }
  | { type: 'addDrink'; volume: number; drinkType: DrinkType; containerId: string | null }
  | { type: 'deleteEntries'; ids: string[] }
  | { type: 'addContainer'; name: string; volumeOz: number; isDefault: boolean }
  | { type: 'updateContainer'; id: string; name: string; volumeOz: number }
  | { type: 'deleteContainers'; ids: string[] }
  | { type: 'updateSettings'; patch: Partial<UserSettings> }
  | { type: 'resetAll' }

function byName(a: Container, b: Container): number {
  return a.name.localeCompare(b.name)
}

/** Picks a new default container when the current one is being deleted, so the
 *  user isn't silently left with an unset default that falls back to "Other". */
function reassignDefaultIfNeeded(
  settings: UserSettings,
  remaining: Container[],
): UserSettings {
  if (settings.defaultContainerId == null) return settings
  if (remaining.some((c) => c.id === settings.defaultContainerId)) return settings
  return { ...settings, defaultContainerId: remaining[0]?.id ?? null }
}

function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'completeOnboarding': {
      const containers: Container[] = action.containers
        .map((c) => ({ id: newId(), name: c.name, volumeOz: c.volumeOz }))
        .sort(byName)
      return {
        ...state,
        hasCompletedOnboarding: true,
        containers,
        settings: {
          ...state.settings,
          dailyGoalOz: clamped(action.dailyGoalOz, DAILY_GOAL_RANGE.min, DAILY_GOAL_RANGE.max),
          defaultContainerId: containers[0]?.id ?? null,
        },
      }
    }

    case 'addDrink': {
      const entry: DrinkEntry = {
        id: newId(),
        volume: clamped(action.volume, ENTRY_VOLUME_RANGE.min, ENTRY_VOLUME_RANGE.max),
        drinkType: action.drinkType,
        timestamp: new Date().toISOString(),
        containerId: action.containerId,
      }
      return { ...state, drinkEntries: [entry, ...state.drinkEntries] }
    }

    case 'deleteEntries':
      return {
        ...state,
        drinkEntries: state.drinkEntries.filter((e) => !action.ids.includes(e.id)),
      }

    case 'addContainer': {
      const container: Container = {
        id: newId(),
        name: action.name.trim(),
        volumeOz: action.volumeOz,
      }
      const containers = [...state.containers, container].sort(byName)
      return {
        ...state,
        containers,
        settings: action.isDefault
          ? { ...state.settings, defaultContainerId: container.id }
          : state.settings,
      }
    }

    case 'updateContainer':
      return {
        ...state,
        containers: state.containers
          .map((c) =>
            c.id === action.id
              ? { ...c, name: action.name.trim(), volumeOz: action.volumeOz }
              : c,
          )
          .sort(byName),
      }

    case 'deleteContainers': {
      const containers = state.containers.filter((c) => !action.ids.includes(c.id))
      return {
        ...state,
        containers,
        settings: reassignDefaultIfNeeded(state.settings, containers),
      }
    }

    case 'updateSettings': {
      const merged = { ...state.settings, ...action.patch }
      return {
        ...state,
        settings: {
          ...merged,
          dailyGoalOz: clamped(merged.dailyGoalOz, DAILY_GOAL_RANGE.min, DAILY_GOAL_RANGE.max),
        },
      }
    }

    case 'resetAll':
      return emptyData()
  }
}


// MARK: - Context

interface AppStateValue {
  data: AppData
  dispatch: Dispatch<Action>
  /** Entries logged today, newest first. */
  todaysEntries: DrinkEntry[]
  /** All entries, newest first. */
  entriesNewestFirst: DrinkEntry[]
  totalTodayOz: number
  dailyGoalOz: number
  goalAchieved: boolean
  lastDrinkDate: Date | null
  /** Falls back to "Dewy" when the user hasn't named their buddy. */
  buddyName: string
  containerById: (id: string | null) => Container | undefined
  defaultContainer: Container | undefined
}

const AppStateContext = createContext<AppStateValue | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(reducer, undefined, loadData)

  useEffect(() => {
    saveData(data)
  }, [data])

  const value = useMemo<AppStateValue>(() => {
    const entriesNewestFirst = [...data.drinkEntries].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    const todaysEntries = entriesNewestFirst.filter((e) => isToday(new Date(e.timestamp)))
    const totalTodayOz = todaysEntries.reduce((sum, e) => sum + e.volume, 0)
    const dailyGoalOz = data.settings.dailyGoalOz
    const containerById = (id: string | null) =>
      id == null ? undefined : data.containers.find((c) => c.id === id)

    return {
      data,
      dispatch,
      entriesNewestFirst,
      todaysEntries,
      totalTodayOz,
      dailyGoalOz,
      goalAchieved: totalTodayOz >= dailyGoalOz,
      lastDrinkDate: entriesNewestFirst[0]
        ? new Date(entriesNewestFirst[0].timestamp)
        : null,
      buddyName: data.settings.buddyName.trim() || 'Dewy',
      containerById,
      defaultContainer: containerById(data.settings.defaultContainerId),
    }
  }, [data])

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState(): AppStateValue {
  const value = useContext(AppStateContext)
  if (!value) throw new Error('useAppState must be used inside an AppStateProvider')
  return value
}
