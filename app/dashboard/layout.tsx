'use client'

import { AppShell } from '@/components/common/AppShell'
import { useAuthGuard } from '@/hooks/use-auth-guard'
import { usePathname } from 'next/navigation'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {

  useAuthGuard(true)
  const isCreditDetailsPage = usePathname() === '/dashboard/credits'

  return (
    <AppShell
      fillViewport={!isCreditDetailsPage}
      mainClassName={`flex flex-1 w-full px-6 py-8 ${isCreditDetailsPage ? '' : 'min-h-0 overflow-hidden'}`}
      contentClassName={`w-full max-w-5xl mx-auto flex flex-col ${isCreditDetailsPage ? '' : 'min-h-0'}`}
    >
      {children}
    </AppShell>
  )
}
