import { useState } from 'react'
import { Icon, type IconName } from './components/Icon'
import { AddDrink } from './screens/AddDrink'
import { BuddyHome } from './screens/BuddyHome'
import { Containers } from './screens/Containers'
import { Settings } from './screens/Settings'
import { Summary } from './screens/Summary'
import { OnboardingFlow } from './screens/onboarding/OnboardingFlow'
import { useReminders } from './services/reminders'
import { useAppState } from './store/AppState'

type Tab = 'buddy' | 'summary' | 'settings'

const TABS: Array<{ id: Tab; label: string; icon: IconName }> = [
  { id: 'buddy', label: 'Buddy', icon: 'drop.fill' },
  { id: 'summary', label: 'Summary', icon: 'chart.bar.fill' },
  { id: 'settings', label: 'Settings', icon: 'gear' },
]

/** Port of `ContentView.swift` (the tab shell) plus `HydrationTrackerApp`'s
 *  onboarding gate. */
export function App() {
  const { data, lastDrinkDate, buddyName } = useAppState()
  const [tab, setTab] = useState<Tab>('buddy')
  const [addingDrink, setAddingDrink] = useState(false)
  const [managingContainers, setManagingContainers] = useState(false)

  // Keeps the reminder timer mounted for the life of the app, the way
  // `ContentView` reconciles the notification schedule on every activation.
  useReminders({ settings: data.settings, lastDrinkDate, buddyName })

  if (!data.hasCompletedOnboarding) return <OnboardingFlow />

  return (
    <div className="app">
      {tab === 'buddy' && <BuddyHome onAddDrink={() => setAddingDrink(true)} />}
      {tab === 'summary' && <Summary onAddDrink={() => setAddingDrink(true)} />}
      {tab === 'settings' &&
        (managingContainers ? (
          <Containers onBack={() => setManagingContainers(false)} />
        ) : (
          <Settings onManageContainers={() => setManagingContainers(true)} />
        ))}

      <nav className="tabbar" aria-label="Main">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="tabbar__item"
            aria-current={tab === item.id ? 'page' : undefined}
            onClick={() => {
              setTab(item.id)
              if (item.id !== 'settings') setManagingContainers(false)
            }}
          >
            <Icon name={item.icon} size={22} />
            {item.label}
          </button>
        ))}
      </nav>

      {addingDrink && <AddDrink onClose={() => setAddingDrink(false)} />}
    </div>
  )
}
