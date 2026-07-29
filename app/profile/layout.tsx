'use client'

import { AppShell } from '@/components/common/AppShell'
import { useAuthGuard } from '@/hooks/use-auth-guard'

interface ProfileLayoutProps {
  children: React.ReactNode
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  useAuthGuard(true)

  return (
    <AppShell
      mainClassName="flex-1 w-full px-6 py-8"
      contentClassName="w-full max-w-5xl mx-auto"
    >
      {children}
    </AppShell>
  )
}
