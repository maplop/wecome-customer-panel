'use client'

import Image from 'next/image'
import StepIndicator from './StepIndicator'

interface OnboardingShellProps {
  children: React.ReactNode
  step: number
  totalSteps: number
  showIndicator?: boolean
}

export default function OnboardingShell({ children, step, totalSteps, showIndicator = true }: OnboardingShellProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header
        className="flex items-center justify-between px-5 py-4 border-b border-border/60"
        style={{ backgroundColor: '#2B2929' }}
      >
        <div className="flex items-center">
          <Image
            src="/logo.png"
            alt="Wecome"
            width={171}
            height={32}
            priority
            className="h-8 w-auto object-contain"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          <span className="text-xs text-muted-foreground">Conexión segura</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col items-center px-4 py-8 md:py-12">
        <div className="w-full max-w-110 flex flex-col gap-6">
          {showIndicator && step > 0 && (
            <StepIndicator current={step} total={totalSteps} />
          )}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-5 text-center border-t border-border/60">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} CreditoNomina &mdash; Institución supervisada por la CNBV &middot; CONDUSEF: 800 999 8080
        </p>
      </footer>
    </div>
  )
}
