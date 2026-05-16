'use client'

import { useState } from 'react'
import OnboardingShell from '@/components/onboarding/OnboardingShell'
import StepLogin from '@/components/onboarding/StepLogin'
import StepUserConfirm from '@/components/onboarding/StepUserConfirm'
import StepIdentity from '@/components/onboarding/StepIdentity'
import StepCreateAccount from '@/components/onboarding/StepCreateAccount'
import StepPersonalData from '@/components/onboarding/StepPersonalData'
import StepFinancialData from '@/components/onboarding/StepFinancialData'
import StepUploadDocuments from '@/components/onboarding/StepUploadDocuments'
import StepCreditResult from '@/components/onboarding/StepCreditResult'
import StepCreditSelection from '@/components/onboarding/StepCreditSelection'
import StepCreditSummary from '@/components/onboarding/StepCreditSummary'
import StepFinalConfirm from '@/components/onboarding/StepFinalConfirm'
import StepSuccess from '@/components/onboarding/StepSuccess'
import type { LoggedUser } from '@/components/Auth/types'
import Auth from '@/components/Auth'
import DashboardSolicitud from '@/components/onboarding/DashboardSolicitud'

// Steps that count in the progress indicator (1-indexed, 0 = success/no-indicator)
const TOTAL_STEPS = 11

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

  // Login modal & session state
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loggedUser, setLoggedUser] = useState<LoggedUser | null>(null)
  const [showDashboard, setShowDashboard] = useState(false)

  const next = () => setStep(s => s + 1)
  const back = () => setStep(s => Math.max(1, s - 1))

  const patch = (update: Partial<FormData>) => setData(d => ({ ...d, ...update }))

  const restart = () => {
    setStep(1)
    setData({})
  }

  const handleLoginSuccess = (user: LoggedUser) => {
    setLoggedUser(user)
    setShowDashboard(true)
    setShowLoginModal(false)
  }

  const handleLogout = () => {
    setLoggedUser(null)
    setShowDashboard(false)
  }

  const showIndicator = step >= 1 && step <= TOTAL_STEPS
  const isSuccess = step > TOTAL_STEPS

  const handleNewRequest = () => {
    setShowDashboard(false)
    restart()
  }

  const goToDashboard = () => {
    setShowDashboard(true)
    setStep(1)
    setData({})
  }

  // If user is logged in and wants to see dashboard, show it (full-page layout, no shell)
  if (loggedUser && showDashboard) {
    return (
      <>
        {showLoginModal && (
          <Auth
            onClose={() => setShowLoginModal(false)}
            onSuccess={handleLoginSuccess}
          />
        )}
        <DashboardSolicitud
          user={loggedUser}
          onLogout={handleLogout}
          onNewRequest={handleNewRequest}
        />
      </>
    )
  }

  return (
    <>
      {/* Login modal — rendered above everything */}
      {showLoginModal && (
        <Auth
          onClose={() => setShowLoginModal(false)}
          onSuccess={handleLoginSuccess}
        />
      )}

      <OnboardingShell step={step} totalSteps={TOTAL_STEPS} showIndicator={showIndicator && !isSuccess}>
        {step === 1 && (
          <StepLogin
            onNext={({ curp }) => {
              patch({ curp })
              next()
            }}
            onLoginClick={() => setShowLoginModal(true)}
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
            onNext={() => next()}
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
          <StepPersonalData
            onNext={() => next()}
            onBack={back}
          />
        )}

        {step === 6 && (
          <StepUploadDocuments
            onNext={() => next()}
            onBack={back}
          />
        )}

        {step === 7 && (
          <StepFinancialData
            onNext={({ salary }) => {
              patch({ salary })
              next()
            }}
            onBack={back}
          />
        )}

        {step === 8 && (
          <StepCreditResult
            salary={data.salary ?? 0}
            onNext={next}
            onBack={back}
          />
        )}

        {step === 9 && (
          <StepCreditSelection
            salary={data.salary ?? 0}
            onNext={({ amount, term }) => {
              patch({ amount, term })
              next()
            }}
            onBack={back}
          />
        )}

        {step === 10 && (
          <StepCreditSummary
            amount={data.amount ?? 0}
            term={data.term ?? 12}
            onNext={next}
            onBack={back}
          />
        )}

        {step === 11 && (
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
            onRestart={goToDashboard}
          />
        )}
      </OnboardingShell>
    </>
  )
}
