'use client'

import { useState } from 'react'
import OnboardingShell from '@/components/onboarding/OnboardingShell'
import StepLogin from '@/components/onboarding/StepLogin'
import StepUserConfirm from '@/components/onboarding/StepUserConfirm'
import StepIdentity from '@/components/onboarding/StepIdentity'
import StepCreateAccount from '@/components/onboarding/StepCreateAccount'
import StepFinancialData from '@/components/onboarding/StepFinancialData'
import StepCreditResult from '@/components/onboarding/StepCreditResult'
import StepCreditSelection from '@/components/onboarding/StepCreditSelection'
import StepCreditSummary from '@/components/onboarding/StepCreditSummary'
import StepFinalConfirm from '@/components/onboarding/StepFinalConfirm'
import StepSuccess from '@/components/onboarding/StepSuccess'

// Steps that count in the progress indicator (1-indexed, 0 = success/no-indicator)
const TOTAL_STEPS = 9

interface FormData {
  curp: string
  email: string
  salary: number
  amount: number
  term: number
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<Partial<FormData>>({})

  const next = () => setStep(s => s + 1)
  const back = () => setStep(s => Math.max(1, s - 1))

  const patch = (update: Partial<FormData>) => setData(d => ({ ...d, ...update }))

  const restart = () => {
    setStep(1)
    setData({})
  }

  const showIndicator = step >= 1 && step <= TOTAL_STEPS
  const isSuccess = step > TOTAL_STEPS

  return (
    <OnboardingShell step={step} totalSteps={TOTAL_STEPS} showIndicator={showIndicator && !isSuccess}>
      {step === 1 && (
        <StepLogin
          onNext={({ curp }) => {
            patch({ curp })
            next()
          }}
        />
      )}

      {step === 2 && (
        <StepUserConfirm
          curp={data.curp ?? ''}
          onNext={next}
          onBack={back}
        />
      )}

      {step === 3 && (
        <StepIdentity
          email={data.email ?? 'usuario@empresa.com'}
          onNext={({ code }) => {
            // In production: validate OTP via API
            console.log('[v0] OTP verified:', code)
            next()
          }}
          onBack={back}
        />
      )}

      {step === 4 && (
        <StepCreateAccount
          onNext={({ email }) => {
            patch({ email })
            next()
          }}
          onBack={back}
        />
      )}

      {step === 5 && (
        <StepFinancialData
          onNext={({ salary }) => {
            patch({ salary })
            next()
          }}
          onBack={back}
        />
      )}

      {step === 6 && (
        <StepCreditResult
          salary={data.salary ?? 0}
          onNext={next}
          onBack={back}
        />
      )}

      {step === 7 && (
        <StepCreditSelection
          salary={data.salary ?? 0}
          onNext={({ amount, term }) => {
            patch({ amount, term })
            next()
          }}
          onBack={back}
        />
      )}

      {step === 8 && (
        <StepCreditSummary
          amount={data.amount ?? 0}
          term={data.term ?? 12}
          onNext={next}
          onBack={back}
        />
      )}

      {step === 9 && (
        <StepFinalConfirm
          amount={data.amount ?? 0}
          term={data.term ?? 12}
          onConfirm={next}
          onBack={back}
        />
      )}

      {step > TOTAL_STEPS && (
        <StepSuccess
          amount={data.amount ?? 0}
          onRestart={restart}
        />
      )}
    </OnboardingShell>
  )
}
