import { redirect } from 'next/navigation'

import { ROUTES } from '@/lib/routes'

export default function AuthRootPage() {
  redirect(ROUTES.AUTH.LOGIN)
}
