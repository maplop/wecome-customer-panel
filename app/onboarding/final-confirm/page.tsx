'use client'

import FinalConfirm from '@/components/Onboarding/FinalConfirm'

export default function FinalConfirmPage() {
  return <FinalConfirm amount={50000} term={12} hasInsurance={true} onConfirm={() => { }} onBack={() => { }} />
}
