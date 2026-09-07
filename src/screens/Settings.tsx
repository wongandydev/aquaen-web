import { useState } from 'react'
import { Confirm } from '../components/Confirm'
import { Icon } from '../components/Icon'
import { DAILY_GOAL_RANGE } from '../domain/types'
import { clamped } from '../domain/clamp'
import { ozWhole } from '../domain/format'
import { sendTestReminder, useReminderFailure, useSyncedPermission } from '../services/reminders'
import { isUninstalledIOS } from '../services/pwa'
import { useAppState } from '../store/AppState'

/** Port of `SettingsView.swift`. The Premium section is gone — the web build has
 *  no purchases, so the reminder interval and container count are unrestricted. */
export function Settings({ onManageContainers }: { onManageContainers: () => void }) {
  const { data, dispatch, buddyName } = useAppState()
  const settings = data.settings
  const [permission, requestPermission] = useSyncedPermission()
  const [goalDraft, setGoalDraft] = useState(String(settings.dailyGoalOz))
  const [confirmingReset, setConfirmingReset] = useState(false)

  // Read once: it cannot change without a reload, since installing to the home
  // screen launches a separate window.
  const [needsInstall] = useState(isUninstalledIOS)
  const deliveryFailure = useReminderFailure()
  const [testResult, setTestResult] = useState<'idle' | 'sending' | 'sent'>('idle')

  const runTestReminder = async () => {
    setTestResult('sending')
    const failure = await sendTestReminder(buddyName)
    // A failure renders through `deliveryFailure`; this only reports success,
    // then goes back to inviting another try.
    setTestResult(failure ? 'idle' : 'sent')
    if (!failure) window.setTimeout(() => setTestResult('idle'), 3000)
  }

  const commitGoal = (raw: string) => {
    const parsed = Number(raw)
    if (!Number.isFinite(parsed)) {
      setGoalDraft(String(settings.dailyGoalOz))
      return
    }
    const next = clamped(parsed, DAILY_GOAL_RANGE.min, DAILY_GOAL_RANGE.max)
    setGoalDraft(String(next))
    dispatch({ type: 'updateSettings', patch: { dailyGoalOz: next } })
  }

  const toggleReminders = async (enabled: boolean) => {
    dispatch({ type: 'updateSettings', patch: { reminderEnabled: enabled } })
    if (enabled) await requestPermission()
  }

  return (
    <div className="screen">
      <header className="nav">
        <h1 className="nav__title">Settings</h1>
      </header>

      <div className="screen__scroll">
        <section className="section" style={{ marginTop: 8 }}>
          <h2 className="section__title">Your Buddy</h2>
          <div className="section__body">
            <label className="row">
              <span className="row__label">Name</span>
              <input
                className="input input--inline"
                style={{ width: 160 }}
                value={settings.buddyName}
                placeholder="Dewy"
                onChange={(e) =>
                  dispatch({ type: 'updateSettings', patch: { buddyName: e.target.value } })
                }
              />
            </label>
          </div>
        </section>

        <section className="section">
          <h2 className="section__title">Daily Goal</h2>
          <div className="section__body">
            <label className="row">
              <span className="row__label">Goal (oz)</span>
              <input
                className="input input--inline"
                type="number"
                inputMode="decimal"
                min={DAILY_GOAL_RANGE.min}
                max={DAILY_GOAL_RANGE.max}
                value={goalDraft}
                onChange={(e) => setGoalDraft(e.target.value)}
                onBlur={(e) => commitGoal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && commitGoal(e.currentTarget.value)}
              />
            </label>
          </div>
          <p className="hint" style={{ margin: '8px 4px 0' }}>
            Between {DAILY_GOAL_RANGE.min} and {DAILY_GOAL_RANGE.max} oz. A general wellness
            estimate, not medical advice.
          </p>
        </section>

        <section className="section">
          <h2 className="section__title">Reminders</h2>
          <div className="section__body">
            <label className="row">
              <span className="row__label">Enable Reminders</span>
              <input
                type="checkbox"
                checked={settings.reminderEnabled}
                onChange={(e) => void toggleReminders(e.target.checked)}
                style={{ width: 20, height: 20 }}
              />
            </label>

            {settings.reminderEnabled && (
              <label className="row">
                <span className="row__label">Interval (hours)</span>
                <input
                  className="input input--inline"
                  type="number"
                  inputMode="decimal"
                  min="0.25"
                  max="12"
                  step="0.25"
                  value={settings.reminderIntervalHours}
                  onChange={(e) => {
                    const parsed = Number(e.target.value)
                    if (!Number.isFinite(parsed)) return
                    dispatch({
                      type: 'updateSettings',
                      patch: { reminderIntervalHours: clamped(parsed, 0.25, 12) },
                    })
                  }}
                />
              </label>
            )}

            {settings.reminderEnabled && permission === 'granted' && (
              <button
                type="button"
                className="row row--button"
                onClick={() => void runTestReminder()}
              >
                <span className="row__label">Send a Test Reminder</span>
                <span className="muted">
                  {testResult === 'sending' ? 'Sending…' : testResult === 'sent' ? 'Sent' : 'Try it'}
                </span>
              </button>
            )}
          </div>

          {deliveryFailure && (
            <p className="hint" style={{ margin: '8px 4px 0', color: 'var(--rust)' }}>
              A reminder could not be delivered: {deliveryFailure}. Reminders are enabled
              and permitted, but this browser refused to show one.
            </p>
          )}

          {settings.reminderEnabled && (
            <p className="hint" style={{ margin: '8px 4px 0' }}>
              {permission === 'unsupported'
                ? needsInstall
                  ? 'Safari only allows notifications for installed apps. Tap Share, then “Add to Home Screen”, and open Aquaen from there to get reminders.'
                  : 'This browser does not support notifications, so reminders cannot be delivered.'
                : permission === 'denied'
                  ? 'Notifications are blocked for this site. Re-allow them in your browser’s site settings to get reminders.'
                  : permission === 'default'
                    ? 'Notifications are not enabled yet — turn the toggle off and on to be asked again.'
                    : 'Quiet hours are 10 PM – 7 AM. Reminders only fire while an Aquaen tab is open — a web page cannot wake itself the way the iOS app can.'}
            </p>
          )}
        </section>

        <section className="section">
          <h2 className="section__title">Containers</h2>
          <div className="section__body">
            <button type="button" className="row row--button" onClick={onManageContainers}>
              <span className="row__label">Manage Containers</span>
              <span className="muted" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {data.containers.length}
                <Icon name="chevron.right" size={16} />
              </span>
            </button>

            <label className="row">
              <span className="row__label">Default Container</span>
              <select
                className="select select--inline"
                value={settings.defaultContainerId ?? ''}
                onChange={(e) =>
                  dispatch({
                    type: 'updateSettings',
                    patch: { defaultContainerId: e.target.value || null },
                  })
                }
              >
                <option value="">None</option>
                {data.containers.map((container) => (
                  <option key={container.id} value={container.id}>
                    {container.name} ({ozWhole(container.volumeOz)} oz)
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="section">
          <h2 className="section__title">Feedback</h2>
          <div className="section__body">
            <a
              className="row row--button"
              href="mailto:aquaen.cs@gmail.com?subject=Aquaen%20Feedback"
              style={{ display: 'flex', textDecoration: 'none', color: 'inherit' }}
            >
              <span className="row__label">Email Feedback</span>
              <span className="muted" style={{ display: 'inline-flex' }}>
                <Icon name="envelope" size={18} />
              </span>
            </a>
          </div>
        </section>

        <section className="section">
          <h2 className="section__title">Data</h2>
          <div className="section__body">
            <button
              type="button"
              className="row row--button"
              onClick={() => setConfirmingReset(true)}
            >
              <span className="row__label" style={{ color: 'var(--rust)' }}>
                Erase All Data
              </span>
              <span className="muted" style={{ display: 'inline-flex', color: 'var(--rust)' }}>
                <Icon name="trash" size={18} />
              </span>
            </button>
          </div>
          <p className="hint" style={{ margin: '8px 4px 0' }}>
            {buddyName}, your goal, containers, and every logged drink live only in this
            browser — nothing is uploaded anywhere.
          </p>
          {needsInstall && (
            <p className="hint" style={{ margin: '8px 4px 0' }}>
              Safari clears that storage after 7 days without a visit. Tap Share, then “Add
              to Home Screen” to keep your history for good.
            </p>
          )}
        </section>

        <div style={{ height: 16 }} />
      </div>

      {confirmingReset && (
        <Confirm
          title="Erase all Aquaen data?"
          message="Your goal, containers, and every logged drink are deleted, and onboarding starts over. This cannot be undone."
          confirmLabel="Erase Everything"
          onConfirm={() => {
            dispatch({ type: 'resetAll' })
            setConfirmingReset(false)
          }}
          onCancel={() => setConfirmingReset(false)}
        />
      )}
    </div>
  )
}
