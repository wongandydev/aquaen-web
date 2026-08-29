import { Icon, type IconName } from '../../components/Icon'

/** Port of `WelcomeView.swift`. */
export function Welcome({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="screen">
      <div className="screen__scroll" style={{ paddingTop: 32 }}>
        <div className="stack" style={{ gap: 32 }}>
          <div className="center stack--tight" style={{ display: 'grid', gap: 16, justifyItems: 'center' }}>
            <span style={{ color: 'var(--water)' }}>
              <Icon name="drop.circle" size={80} />
            </span>
            <h1 style={{ fontSize: 34, lineHeight: 1.15 }} className="serif">
              Welcome to
              <br />
              Aquaen
            </h1>
          </div>

          <div className="stack" style={{ gap: 24 }}>
            <FeatureRow
              icon="target"
              title="Track Your Goal"
              description="Set personalized hydration goals and monitor your daily progress"
            />
            <FeatureRow
              icon="bell.badge"
              title="Smart Reminders"
              description="Get timely notifications to stay hydrated throughout the day"
            />
            <FeatureRow
              icon="chart.bar.fill"
              title="See Your Progress"
              description="View daily summaries and track your hydration trends over time"
            />
          </div>
        </div>
      </div>

      <div style={{ padding: '0 32px 20px' }}>
        <button type="button" className="btn btn--block" onClick={onContinue}>
          Get Started
        </button>
      </div>
    </div>
  )
}

function FeatureRow({
  icon,
  title,
  description,
}: {
  icon: IconName
  title: string
  description: string
}) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <span style={{ color: 'var(--terracotta)', width: 32, flexShrink: 0 }}>
        <Icon name={icon} size={26} />
      </span>
      <div>
        <strong>{title}</strong>
        <p className="muted" style={{ margin: '4px 0 0', fontSize: 15 }}>{description}</p>
      </div>
    </div>
  )
}
