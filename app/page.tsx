'use client'

import { useState } from 'react'
import OnboardingShell from '@/components/Onboarding/OnboardingShell'
import StepCurpVerification from '@/components/Onboarding/StepCurpVerification'
import StepUserConfirm from '@/components/Onboarding/StepUserConfirm'
import StepIdentity from '@/components/Onboarding/StepIdentity'
import StepCreateAccount from '@/components/Onboarding/StepCreateAccount'
import StepPersonalData from '@/components/Onboarding/StepPersonalData'
import StepFinancialData from '@/components/Onboarding/StepFinancialData'
import StepUploadDocuments from '@/components/Onboarding/StepUploadDocuments'
import StepCreditResult from '@/components/Onboarding/StepCreditResult'
import StepCreditSelection from '@/components/Onboarding/StepCreditSelection'
import StepCreditSummary from '@/components/Onboarding/StepCreditSummary'
import StepFinalConfirm from '@/components/Onboarding/StepFinalConfirm'
import StepTermsAcceptance from '@/components/Onboarding/StepTermsAcceptance'
import StepSuccess from '@/components/Onboarding/StepSuccess'
import type { LoggedUser } from '@/components/Auth/types'
import Auth from '@/components/Auth'
import DashboardSolicitud from '@/components/Dashbaoard/DashboardSolicitud'

// Steps that count in the progress indicator (1-indexed, 0 = success/no-indicator)
const TOTAL_STEPS = 13

interface FormData {
  curp: string
  email: string
  salary: number
  amount: number
  term: number
  hasInsurance: boolean
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

  const handleNewRequest = () => {
    setShowDashboard(false)
    restart()
  }

  const goToDashboard = () => {
    if (!loggedUser) {
      setLoggedUser({ name: 'María González', email: 'maria.gonzalez@empresa.com', curp: data.curp ?? '' })
    }
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

      <OnboardingShell step={step} totalSteps={TOTAL_STEPS} showIndicator={showIndicator}>
        {step === 1 && (
          <StepCurpVerification
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
            email={data.email ?? 'usuario2@empresa.com'}
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
            onNext={({ amount, term, hasInsurance }) => {
              patch({ amount, term, hasInsurance })
              next()
            }}
            onBack={back}
          />
        )}

        {step === 10 && (
          <StepCreditSummary
            amount={data.amount ?? 0}
            term={data.term ?? 12}
            hasInsurance={data.hasInsurance ?? false}
            onNext={next}
            onBack={back}
          />
        )}

        {step === 11 && (
          <StepFinalConfirm
            amount={data.amount ?? 0}
            term={data.term ?? 12}
            hasInsurance={data.hasInsurance ?? false}
            onConfirm={next}
            onBack={back}
          />
        )}

        {step === 12 && (
          <StepTermsAcceptance
            onNext={next}
            onBack={back}
          />
        )}

        {step === 13 && (
          <StepSuccess
            amount={data.amount ?? 0}
            onRestart={goToDashboard}
          />
        )}
      </OnboardingShell>
    </>
  )
}
