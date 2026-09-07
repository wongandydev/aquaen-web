import { afterEach, describe, expect, it, vi } from 'vitest'
import { sendTestReminder } from '../services/reminders'

/** Covers the delivery-failure path that Chrome on Android takes.
 *
 *  This is the one branch that cannot be reproduced on a desktop browser, so it
 *  is worth pinning down here: when the notification cannot be raised, the error
 *  has to come back rather than disappear into a `catch`. No service worker is
 *  registered under vitest, so `showReminder` always falls through to the
 *  `Notification` constructor — which is exactly the path Android breaks. */

const original = Reflect.get(globalThis, 'Notification')

afterEach(() => {
  if (original === undefined) Reflect.deleteProperty(globalThis, 'Notification')
  else Reflect.set(globalThis, 'Notification', original)
  vi.restoreAllMocks()
})

/** `new Notification(...)` needs a constructible function, which an arrow
 *  function is not — so wrap the behaviour under test in a real one. */
function stubNotification(impl: (title: string, options?: NotificationOptions) => void) {
  function Fake(this: unknown, title: string, options?: NotificationOptions) {
    impl(title, options)
  }
  Reflect.set(globalThis, 'Notification', Fake)
}

describe('sendTestReminder', () => {
  it('reports the error when the browser refuses to construct a notification', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    stubNotification(() => {
      throw new TypeError('Illegal constructor. Use ServiceWorkerRegistration.showNotification()')
    })

    const failure = await sendTestReminder('Dewy')

    expect(failure).toContain('Illegal constructor')
  })

  it('reports nothing when the notification is raised', async () => {
    stubNotification(() => {})

    const failure = await sendTestReminder('Dewy')

    expect(failure).toBeNull()
  })

  it('clears a previous failure once delivery succeeds again', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    stubNotification(() => {
      throw new Error('nope')
    })
    expect(await sendTestReminder('Dewy')).toBe('nope')

    stubNotification(() => {})
    expect(await sendTestReminder('Dewy')).toBeNull()
  })

  it('passes the buddy name into the notification body', async () => {
    const seen: Array<{ title: string; body: string | undefined }> = []
    stubNotification((title, options) => {
      seen.push({ title, body: options?.body })
    })

    await sendTestReminder('Puddles')

    expect(seen).toHaveLength(1)
    expect(seen[0].body).toContain('Puddles')
  })
})
