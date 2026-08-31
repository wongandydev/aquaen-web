# Aquaen — Web

A web port of [Aquaen](../iOS/HydrationTracker), the vintage-themed hydration
tracker for iOS. Same daily goal, same containers, same water buddy — running in
a browser, with everything stored locally.

## Running it

```sh
npm install
npm run dev      # http://localhost:5173
npm test         # domain tests (vitest)
npm run build    # type-check + production bundle into dist/
```

No backend, no accounts, no build-time configuration. `npm run build` produces a
static `dist/` that can be served from anywhere.

## What carried over from iOS

Everything except the parts that only exist because of the App Store:

| iOS | Web |
| --- | --- |
| Onboarding (welcome → goal → containers) | Same three steps, same 0.67 oz/lb × activity-level goal maths |
| Buddy tab with Dewy | Same seven stages, same copy, redrawn as inline SVG |
| Add Drink / Summary / Settings / Containers | Same screens, same clamps and confirmations |
| Core Data in an App Group | One JSON document in `localStorage` |
| `AquaenTheme` dynamic colors | CSS custom properties, light and dark |
| SF Symbols | A small hand-drawn icon set (`components/Icon.tsx`) |
| `UNUserNotificationCenter` reminders | `Notification` API, foreground only — see below |
| StoreKit, the paywall, Premium gating | **Dropped** — no purchases on the web, so the container limit and the reminder-interval lock are gone |
| WidgetKit extension | Dropped — no equivalent surface |

### Deliberate differences

- **Reminders are best-effort.** iOS hands the OS a schedule that fires whether or
  not the app is running. A web page cannot do that: reminders here are a
  foreground timer, so they only fire while an Aquaen tab is open. The same
  10 PM – 7 AM quiet hours apply. Settings says this plainly rather than implying
  parity.
- **Data is per-browser.** There is no App Group, no iCloud, no sync. Settings has
  an "Erase All Data" action, which is the whole of the data-management story.
- **No analytics, no crash reporter,** matching the iOS app's "Data Not Collected"
  posture. Nothing leaves the browser.

## Mobile

The app installs to the home screen (`public/manifest.webmanifest` plus a service
worker in `public/sw.js`), and on mobile that is not cosmetic:

- **iOS Safari evicts `localStorage` after 7 days without a visit.** Installed web
  apps are exempt, so installing is what keeps a user's history from silently
  disappearing over a week away. Settings says so, but only on an uninstalled iOS
  browser, where it's actually true.
- **Chrome on Android throws on `new Notification()`** and only permits
  `showNotification()` on a service worker registration. Reminders go through the
  registration when one exists and fall back to the constructor on desktop
  browsers without one. Before this, reminders silently never arrived on Android
  while Settings reported permission as granted.
- `navigator.storage.persist()` is requested at startup — the equivalent
  protection on Chromium. Safari ignores it; there, installing is the real fix.

The worker caches the shell so a cold offline launch works. Navigations are
network-first (a stale `index.html` would point at build assets that no longer
exist); hashed assets are cache-first. Bump `CACHE` in `sw.js` to invalidate
everything after a release.

It registers only in production builds — a cached shell fights the dev server. To
exercise it use `npm run build && npm run preview`, not `npm run dev`.

**Reminders are still foreground-only on mobile.** Installing makes them possible;
it does not make them wake the phone. Real background reminders need Web Push and
a server to send it, which the no-backend decision rules out.

## Layout

```
src/
  domain/      Pure logic, ported 1:1 from Swift and unit-tested
    buddyEngine.ts      ← BuddyEngine.swift
    buddyStage.ts       ← BuddyStage+Presentation.swift
    hydrationFacts.ts   ← HydrationFactCatalog.swift
    onboarding.ts       ← OnboardingData.swift
    dates.ts            ← the Calendar/DateFormatter helpers
  store/       localStorage document + a reducer over it
  screens/     One file per iOS view
  components/  BuddyCharacter (the SVG port), Sheet, Confirm, Meter, Icon
  services/    reminders.ts — the Notification API timer
```

`src/domain` has no DOM dependencies, which is what keeps the ported logic
testable the way the Swift original is.

## Tests

`src/test/buddyEngine.test.ts` is a direct port of `BuddyEngineTests.swift` —
same cases, same expectations, so a change in stage behavior on either platform
shows up as a diff against the same list. `onboarding.test.ts` covers the goal
maths and the calendar helpers that replaced `Calendar`.

## Hydration facts

Every fact in `hydrationFacts.ts` is anchored to a clinical or peer-reviewed
source, and the buddy's stages map to *severity bands* of dehydration rather than
a day countdown. The research backing lives in the iOS repo at
`docs/hydration-facts.md`; keep the two in sync when editing copy.
