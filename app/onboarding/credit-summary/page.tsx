'use client'

import CreditSummary from '@/components/Onboarding/CreditSummary'

export default function CreditSummaryPage() {
  return <CreditSummary amount={50000} term={12} hasInsurance={true} onNext={() => { }} onBack={() => { }} />
}

