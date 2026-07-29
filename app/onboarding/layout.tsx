'use client'

import { usePathname } from 'next/navigation'
import { AppShell } from '@/components/common/AppShell'
import { ONBOARDING_STEPS, PROTECTED_ONBOARDING_ROUTES } from '@/lib/routes'
import { useAuthGuard } from '@/hooks/use-auth-guard'

interface OnboardingLayoutProps {
  children: React.ReactNode
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  const pathname = usePathname()
  const currentStep = ONBOARDING_STEPS.find((item) => item.route === pathname)
  const current = currentStep?.step ?? 0
  const total = ONBOARDING_STEPS.length
  const shouldProtectRoute = PROTECTED_ONBOARDING_ROUTES.has(pathname)

  useAuthGuard(shouldProtectRoute)

  return (
    <AppShell
      showStepIndicator={current > 0}
      currentStep={current}
      totalSteps={total}
      wrapInCard
    >
      {children}
    </AppShell>
  )
}
