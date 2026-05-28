'use client'
import CreditDashboard from '@/components/Dashboard/CreditDashboard'
import { useAuthGuard } from '@/hooks/use-auth-guard'

export default function DashboardPage() {
  useAuthGuard(true)

  return <CreditDashboard />
}
