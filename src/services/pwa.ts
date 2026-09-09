/** Service worker registration and storage durability.
 *
 *  Both of these are mobile concerns. Installing the app is what exempts it
 *  from iOS Safari's 7-day eviction of `localStorage`, and `persist()` is the
 *  equivalent request on Chromium. Neither is guaranteed; both are cheap. */

let registration: ServiceWorkerRegistration | null = null

/** The registration, once it exists. Reminders need it to display notifications
 *  on Android, where the `Notification` constructor throws. */
export function serviceWorkerRegistration(): ServiceWorkerRegistration | null {
  return registration
}

export async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return
  try {
    // Both paths are relative to the deploy base: on a GitHub Pages project
    // site the app is not at the origin root, and a worker cannot claim a
    // scope above its own URL.
    const base = import.meta.env.BASE_URL
    registration = await navigator.serviceWorker.register(`${base}sw.js`, { scope: base })
  } catch {
    /* An unavailable worker costs offline support and Android reminders; the
       app itself still runs entirely from memory and localStorage. */
  }
}

/** Asks the browser to exempt this origin from eviction under storage pressure.
 *
 *  Chromium grants this silently for engaged sites, Firefox prompts, and Safari
 *  ignores it — on iOS the real protection is being installed to the home
 *  screen, not this call. Returns whether storage ended up persistent. */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) return false
  try {
    if (await navigator.storage.persisted()) return true
    return await navigator.storage.persist()
  } catch {
    return false
  }
}

/** True when running as an installed app rather than a browser tab. Settings
 *  uses this to explain the iOS storage caveat only where it applies. */
export function isInstalled(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia?.('(display-mode: standalone)').matches) return true
  // iOS Safari predates `display-mode` and sets this instead.
  return (window.navigator as { standalone?: boolean }).standalone === true
}

/** iOS Safari evicts script-writable storage after 7 days without a visit, and
 *  the only exemption is installing to the home screen. */
export function isUninstalledIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const iOS = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  return iOS && !isInstalled()
}
