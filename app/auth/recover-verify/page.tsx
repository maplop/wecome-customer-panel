import { Suspense } from 'react'
import RecoverVerify from '@/components/Auth/RecoverVerify'
import { Spinner } from '@/components/ui/spinner'

export default function RecoverVerifyPage() {
  return (
    <Suspense fallback={<Spinner className="mx-auto my-20" />}>
      <RecoverVerify />
    </Suspense>
  )
}
