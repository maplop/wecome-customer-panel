'use client'

import { usePathname } from 'next/navigation'

import StepIndicator from '@/components/common/StepIndicator'
import Header from '@/components/common/Header'
import { ONBOARDING_STEPS } from '@/lib/routes'

interface OnboardingLayoutProps {
  children: React.ReactNode
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  const pathname = usePathname()
  const currentStep = ONBOARDING_STEPS.find((item) => item.route === pathname)
  const current = currentStep?.step ?? 0
  const total = ONBOARDING_STEPS.length

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
      <footer className="py-4 px-5 text-center border-t border-border/60">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Wecome &mdash; Institución supervisada por la CNBV &middot; CONDUSEF: 800 999 8080
        </p>
      </footer>
    </div>
  )
}
