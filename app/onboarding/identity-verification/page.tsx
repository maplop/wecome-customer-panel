'use client'

import IdentityVerification from '@/components/Onboarding/IdentityVerification'

export default function IdentityVerificationPage() {
  return (
    <IdentityVerification
      email="maria.gonzalez@empresa.com"
      onNext={() => { }}
      onBack={() => { }}
    />
  )
}

