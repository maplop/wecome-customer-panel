'use client'

import { usePathname } from 'next/navigation'

import { Header, StepIndicator, Footer } from '@/components/common'
import { ONBOARDING_STEPS, ROUTES } from '@/lib/routes'
import { useAuthGuard } from '@/hooks/use-auth-guard'

interface OnboardingLayoutProps {
  children: React.ReactNode
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  const pathname = usePathname()
  const currentStep = ONBOARDING_STEPS.find((item) => item.route === pathname)
  const current = currentStep?.step ?? 0
  const total = ONBOARDING_STEPS.length
  const protectedOnboardingRoutes = new Set<string>([
    ROUTES.ONBOARDING.PERSONAL_DATA,
    ROUTES.ONBOARDING.UPLOAD_DOCUMENTS,
    ROUTES.ONBOARDING.FINANCIAL_DATA,
    ROUTES.ONBOARDING.CREDIT_RESULT,
    ROUTES.ONBOARDING.CREDIT_SELECTION,
    ROUTES.ONBOARDING.CREDIT_SUMMARY,
    ROUTES.ONBOARDING.FINAL_CONFIRM,
    ROUTES.ONBOARDING.TERMS_ACCEPTANCE,
    ROUTES.ONBOARDING.CREDIT_SUCCESS,
  ])
  const shouldProtectRoute = protectedOnboardingRoutes.has(pathname)

  useAuthGuard(shouldProtectRoute)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Main content */}
      <main className="flex flex-1 flex-col items-center px-4 py-8 md:py-12">
        <div className="w-full max-w-110 flex flex-col gap-6">
          {current > 0 && (
            <StepIndicator current={current} total={total} />
          )}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
