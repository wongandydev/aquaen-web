/* Aquaen service worker.
 *
 *  Two jobs, both in service of mobile:
 *
 *  1. Make the app installable and offline-capable. Installing to the home
 *     screen is also what exempts the app from iOS Safari's 7-day eviction of
 *     script-writable storage, so this is what keeps a user's history from
 *     silently vanishing after a week away.
 *  2. Make reminders possible on Android at all. Chrome on Android throws on
 *     `new Notification()` and only permits `showNotification()` on a service
 *     worker registration — so a registered worker has to exist before the page
 *     can raise one. Clicking the notification is handled here.
 *
 *  There is no push subscription and no server. Reminders are still foreground
 *  only — this worker displays what a running tab asks it to, it does not wake
 *  itself up on a timer.
 */

// Bump to invalidate every cached response after a release.
const CACHE = 'aquaen-v1'

// The shell is cached eagerly so a cold offline launch works. Hashed build
// assets are not listed — they are picked up at runtime below, since their
// names change every build and hardcoding them here would rot immediately.
const SHELL = ['/', '/index.html', '/droplet.svg', '/manifest.webmanifest', '/icon-192.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // `addAll` rejects the whole batch if any single request fails, which
      // would leave the worker uninstalled over one missing icon.
      .then((cache) => Promise.allSettled(SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Navigations go network-first: a stale index.html would point at build assets
  // that no longer exist, which bricks the app until the cache is cleared.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put('/index.html', copy))
          return response
        })
        .catch(() => caches.match('/index.html').then((hit) => hit ?? Response.error())),
    )
    return
  }

  // Everything else is cache-first. Build assets are content-hashed, so a hit is
  // always the right bytes for the shell that asked for it.
  event.respondWith(
    caches.match(request).then((hit) => {
      if (hit) return hit
      return fetch(request).then((response) => {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put(request, copy))
        }
        return response
      })
    }),
  )
})

// Reminders themselves are raised by the page calling `showNotification()` on
// this registration (see `src/services/reminders.ts`); the worker only needs to
// exist for that to be allowed. What it does own is the click.
//
// Focus an existing tab rather than opening a second copy of the app.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => 'focus' in c)
      if (existing) return existing.focus()
      return self.clients.openWindow('/')
    }),
  )
})
