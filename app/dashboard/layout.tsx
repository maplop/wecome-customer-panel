'use client'

import { AppShell } from '@/components/common/AppShell'
import { useAuthGuard } from '@/hooks/use-auth-guard'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {

  useAuthGuard(true)

  return (
    <AppShell
      fillViewport
      mainClassName="flex flex-1 w-full px-6 py-8 min-h-0 overflow-hidden"
      contentClassName="w-full max-w-5xl mx-auto flex flex-col min-h-0"
    >
      {children}
    </AppShell>
  )
}
