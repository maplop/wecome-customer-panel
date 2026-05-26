'use client'

import { useRouter } from 'next/navigation'
import CreditDashboard from '@/components/Dashboard/CreditDashboard'
import { useAuthGuard } from '@/hooks/use-auth-guard'
import { logout } from '@/services/auth'
import { ROUTES } from '@/lib/routes'

export default function DashboardPage() {
  const router = useRouter()
  useAuthGuard(true)

  return (
    <CreditDashboard
      onLogout={async () => {
        await logout()
        router.replace(ROUTES.AUTH.LOGIN)
      }}
      user={{
        name: 'María González',
        email: 'maria.gonzalez@empresa.com',
        curp: 'GOMR890101MDFRNR01',
      }}
    />
  )
}
