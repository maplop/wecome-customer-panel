'use client'

import CreateAccount from '@/components/Onboarding/CreateAccount'

export default function CreateAccountPage() {
  return (
    <CreateAccount
      onNext={(data) => {
        console.log('Email:', data.email)
        console.log('Password:', data.password)
      }}
      onBack={() => { }}
    />
  )
}
