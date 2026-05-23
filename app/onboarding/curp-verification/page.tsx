'use client'

import { useRouter } from 'next/navigation'

import CurpVerification from '@/components/Onboarding/CurpVerification'
import { ROUTES } from '@/lib/routes'

export default function CurpVerificationPage() {
  const router = useRouter()

  return (
    <CurpVerification
      onNext={(data) => {
        console.log('CURP verificada:', data.curp)
      }}
      onLoginClick={() => {
        router.push(ROUTES.AUTH.LOGIN)
      }}
    />
  )
}
