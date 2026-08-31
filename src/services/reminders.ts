import { useEffect, useRef, useState } from 'react'
import { ACTIVE_DAY_END, ACTIVE_DAY_START } from '../domain/buddyEngine'
import type { UserSettings } from '../domain/types'
import { serviceWorkerRegistration } from './pwa'

/** Hydration reminders, web edition.
 *
 *  The iOS app schedules `UNNotificationRequest`s that the system delivers even
 *  when the app is closed. A web page has no such privilege: notifications can
 *  only be raised while a tab is running. So this polls a timer in the
 *  foreground and posts a notification when one is due — the same quiet-hours
 *  window (10 PM – 7 AM) and the same interval setting, but reminders simply do
 *  not fire while every Aquaen tab is closed. `remindersAreBestEffort` is
 *  surfaced in Settings so that limitation is stated, not hidden. */

export const remindersAreBestEffort = true

export type PermissionState = 'unsupported' | 'default' | 'granted' | 'denied'

const POLL_MS = 60_000

export function notificationPermission(): PermissionState {
  if (typeof Notification === 'undefined') return 'unsupported'
  return Notification.permission as PermissionState
}

export async function requestNotificationPermission(): Promise<PermissionState> {
  if (typeof Notification === 'undefined') return 'unsupported'
  if (Notification.permission !== 'default') return Notification.permission as PermissionState
  try {
    return (await Notification.requestPermission()) as PermissionState
  } catch {
    return 'denied'
  }
}

/** Displays one reminder.
 *
 *  Chrome on Android throws `Illegal constructor` on `new Notification()` and
 *  requires the service worker registration to raise it instead — the old direct
 *  construction meant reminders silently never arrived on Android while Settings
 *  reported permission as granted. So: worker first, constructor as the fallback
 *  for desktop browsers with no worker registered. */
async function showReminder(title: string, body: string): Promise<void> {
  const options: NotificationOptions = {
    body,
    tag: 'aquaen-reminder',
    icon: '/icon-192.png',
  }

  const registration = serviceWorkerRegistration()
  if (registration) {
    try {
      await registration.showNotification(title, options)
      return
    } catch {
      /* fall through to the constructor */
    }
  }

  try {
    new Notification(title, options)
  } catch {
    /* a browser that rejects both paths just means no reminder this tick */
  }
}

function insideActiveWindow(now: Date): boolean {
  const hour = now.getHours()
  return hour >= ACTIVE_DAY_START && hour < ACTIVE_DAY_END
}

interface RemindersInput {
  settings: UserSettings
  lastDrinkDate: Date | null
  buddyName: string
}

/** Drives the foreground reminder timer. Returns the current permission state so
 *  Settings can show it and prompt when the user turns reminders on. */
export function useReminders({ settings, lastDrinkDate, buddyName }: RemindersInput): PermissionState {
  const [permission, setPermission] = useState<PermissionState>(notificationPermission)
  const lastFiredRef = useRef<number>(0)

  // Keep the timer callback reading fresh values without restarting the interval
  // every render.
  const latest = useRef({ settings, lastDrinkDate, buddyName, permission })
  latest.current = { settings, lastDrinkDate, buddyName, permission }

  useEffect(() => {
    const tick = () => {
      const { settings: s, lastDrinkDate: last, buddyName: name, permission: perm } = latest.current
      if (!s.reminderEnabled || perm !== 'granted') return

      const now = new Date()
      if (!insideActiveWindow(now)) return

      const intervalMs = Math.max(s.reminderIntervalHours, 0.25) * 3_600_000

      // Don't nag: an interval must have passed both since the last drink and
      // since the last reminder we raised.
      const sinceLastDrink = last ? now.getTime() - last.getTime() : Infinity
      const sinceLastFired = now.getTime() - lastFiredRef.current
      if (sinceLastDrink < intervalMs || sinceLastFired < intervalMs) return

      lastFiredRef.current = now.getTime()
      void showReminder('Time for water', `${name} is getting thirsty — log a drink to top them up.`)
    }

    const id = window.setInterval(tick, POLL_MS)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    setPermission(notificationPermission())
  }, [settings.reminderEnabled])

  return permission
}

export function useSyncedPermission(): [PermissionState, () => Promise<PermissionState>] {
  const [permission, setPermission] = useState<PermissionState>(notificationPermission)
  const request = async () => {
    const next = await requestNotificationPermission()
    setPermission(next)
    return next
  }
  return [permission, request]
}
