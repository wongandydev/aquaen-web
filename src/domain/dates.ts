/** Calendar helpers, all in the browser's local time zone — the web stand-in for
 *  `Calendar.current`. Day arithmetic goes through a day index (days since the
 *  Unix epoch) so DST transitions never produce a 23- or 25-hour "day". */

/** Days since 1970-01-01, computed from the date's *local* Y/M/D. */
export function dayIndex(date: Date): number {
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  )
}

/** Whole calendar days between two instants, `from` → `to`. */
export function daysBetween(from: Date, to: Date): number {
  return dayIndex(to) - dayIndex(from)
}

export function isToday(date: Date, now: Date = new Date()): boolean {
  return dayIndex(date) === dayIndex(now)
}

export function isYesterday(date: Date, now: Date = new Date()): boolean {
  return dayIndex(date) === dayIndex(now) - 1
}

/** "Sep 15, 2025" — the web equivalent of `DateFormatter.day`/`.sectionHeader`. */
export const dayFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

/** "2:30 PM" — the web equivalent of `DateFormatter.time`. */
export const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
})
