'use client'

import CreditDashboard from '@/components/Dashboard/CreditDashboard'

export default function DashboardPage() {
  return (
    <CreditDashboard
      onLogout={() => { }}
      onNewRequest={() => { }}
      user={{
        name: 'María González',
        email: 'maria.gonzalez@empresa.com',
        curp: 'GOMR890101MDFRNR01'
      }}
    />
  )
}
