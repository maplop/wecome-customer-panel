'use client'

import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { Header } from './Header'
import { StepIndicator } from './StepIndicator'
import { Footer } from './Footer'
import { isAccessTokenValid } from '@/lib/auth-session'
import { useClientDataStore } from '@/stores/client-data-store'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'
import { logout } from '@/services/auth'



interface AppShellProps {
  children: ReactNode
  showStepIndicator?: boolean
  currentStep?: number
  totalSteps?: number
  mainClassName?: string
  contentClassName?: string
  wrapInCard?: boolean
}

export function AppShell({
  children,
  showStepIndicator = false,
  currentStep = 0,
  totalSteps = 0,
  mainClassName = 'flex flex-1 flex-col items-center px-4 py-8 md:py-12',
  contentClassName = 'w-full max-w-110 flex flex-col gap-6',
  wrapInCard = false,
}: AppShellProps) {
  const router = useRouter()
  const session = useClientDataStore((state) => state)


  const canShowAccountMenu = isAccessTokenValid()

  const handleLogout = async () => {
    await logout()
    router.replace(ROUTES.AUTH.LOGIN)
  }

  const userEmail = useMemo(() => {
    const userName = session.client?.pii.email || `${session.client?.pii.name} ${session.client?.pii.apellido_paterno}`.trim() || 'Mi cuenta'
    return userName
  }, [session?.client])

  console.log('Session data in AppShell:', session) // Debug log to check session data

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header showLogout={canShowAccountMenu} onLogout={handleLogout} userEmail={userEmail} />

      <main className={mainClassName}>
        <div className={contentClassName}>
          {showStepIndicator && currentStep > 0 && (
            <StepIndicator current={currentStep} total={totalSteps} />
          )}
          {wrapInCard ? (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              {children}
            </div>
          ) : (
            children
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
