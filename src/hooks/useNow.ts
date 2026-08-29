import { useEffect, useState } from 'react'

/** Re-renders on a fixed cadence — the web equivalent of `TimelineView(.everyMinute)`.
 *  Aligns the first tick to the top of the next minute so the buddy's stage flips
 *  when the clock does, not a random number of seconds later. */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let interval: number | undefined
    const delay = intervalMs - (Date.now() % intervalMs)
    const timeout = window.setTimeout(() => {
      setNow(new Date())
      interval = window.setInterval(() => setNow(new Date()), intervalMs)
    }, delay)

    return () => {
      window.clearTimeout(timeout)
      if (interval) window.clearInterval(interval)
    }
  }, [intervalMs])

  return now
}
