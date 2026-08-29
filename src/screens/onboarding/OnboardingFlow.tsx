import { useState } from 'react'
import type { OnboardingStep } from '../../domain/onboarding'
import { useAppState } from '../../store/AppState'
import { ContainerSetup } from './ContainerSetup'
import { GoalSetup } from './GoalSetup'
import { Welcome } from './Welcome'
import './onboarding.css'

/** Port of `OnboardingFlowView.swift`: welcome → goal → containers, with a
 *  progress bar across the top from the goal step onward. */
export function OnboardingFlow() {
  const { dispatch } = useAppState()
  const [step, setStep] = useState<OnboardingStep>('welcome')
  const [goalOz, setGoalOz] = useState(64)

  const stepNumber = step === 'welcome' ? 1 : step === 'goalSetup' ? 2 : 3

  return (
    <div className="app">
      {step !== 'welcome' && (
        <div className="onboarding-progress" aria-hidden="true">
          <div style={{ width: `${(stepNumber / 3) * 100}%` }} />
        </div>
      )}

      {step === 'welcome' && <Welcome onContinue={() => setStep('goalSetup')} />}

      {step === 'goalSetup' && (
        <GoalSetup
          onContinue={(goal) => {
            setGoalOz(goal)
            setStep('containerSetup')
          }}
        />
      )}

      {step === 'containerSetup' && (
        <ContainerSetup
          onContinue={(containers) =>
            dispatch({ type: 'completeOnboarding', dailyGoalOz: goalOz, containers })
          }
        />
      )}
    </div>
  )
}
