'use client'

import { useState } from 'react'
import { WrapperCard, TitleCard, SubtitleCard, ButtonCard } from '@/components/common'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'
import { isApiClientError } from '@/api/dynamicore/frontend'
import { forgotPassword } from '@/services/auth'

export default function RecoverRequest() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [recoveryLoading, setRecoveryLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendRecoveryCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    const username = email.trim()

    if (!username) {
      setError('Ingresa tu correo electrónico.')
      return
    }

    if (!/\S+@\S+\.\S+/.test(username)) {
      setError('Ingresa un correo electrónico válido.')
      return
    }

    setRecoveryLoading(true)
    try {
      await forgotPassword({ username })
      router.push(`${ROUTES.AUTH.RECOVER_VERIFY}?email=${encodeURIComponent(username)}`)
    } catch (err) {
      if (isApiClientError(err)) {
        const rawType =
          typeof (err.data as { __type?: unknown })?.__type === 'string'
            ? String((err.data as { __type?: string }).__type)
            : ''

        if (rawType.includes('UserNotFoundException')) {
          setError('No encontramos una cuenta con ese correo electrónico.')
        } else if (rawType.includes('LimitExceededException')) {
          setError('Has intentado demasiadas veces. Intenta de nuevo más tarde.')
        } else {
          setError(err.apiDetail || err.apiMessage || err.apiError || err.message)
        }
      } else {
        setError('No fue posible enviar el código. Intenta nuevamente.')
      }
    } finally {
      setRecoveryLoading(false)
    }
  }

  return (
    <WrapperCard>
      <div className="flex flex-col gap-2">
        <TitleCard>Recupera tu contraseña</TitleCard>
        <SubtitleCard>Ingresa tu correo y te enviaremos un código de 6 dígitos.</SubtitleCard>
      </div>

      <form onSubmit={handleSendRecoveryCode} noValidate>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="recover-email" className="text-sm font-medium text-foreground">
              Correo electrónico
            </label>
            <input
              id="recover-email"
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              className={`w-full rounded-xl border px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-accent focus:ring-2 focus:ring-accent/20 bg-background ${error ? 'border-destructive' : 'border-border'}`}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <div className="flex flex-col gap-3">
            <ButtonCard submit disabled={recoveryLoading || !email} loading={recoveryLoading} loadingText="Enviando código...">
              Enviar código
            </ButtonCard>

            <ButtonCard disabled={recoveryLoading} variant="secondary" onClick={() => router.push(ROUTES.AUTH.LOGIN)}>
              Volver al login
            </ButtonCard>
          </div>
        </div>
      </form>
    </WrapperCard>
  )
}
