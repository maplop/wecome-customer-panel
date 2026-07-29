'use client'

import { useState } from 'react'
import { WrapperCard } from '@/components/common/WrapperCard'
import { TitleCard } from '@/components/common/TitleCard'
import { SubtitleCard } from '@/components/common/SubtitleCard'
import { TogglePasswordVisibility } from '@/components/common/TogglePasswordVisibility'
import { ButtonCard } from '@/components/common/ButtonCard'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'
import { isApiClientError } from '@/api/dynamicore/frontend'
import { login } from '@/services/auth'
import { useClientRequestStore } from '@/stores/client-request-store'

function resolvePostLoginRoute(currentRequestStep: unknown): string {
  if (typeof currentRequestStep !== 'string') return ROUTES.DASHBOARD.ROOT

  const normalized = currentRequestStep.trim()
  if (!normalized.startsWith('/')) return ROUTES.DASHBOARD.ROOT

  return normalized
}

export default function Login() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Ingresa correo electrónico y contraseña.')
      return
    }

    setLoading(true)

    try {
      await login({
        email: email.trim(),
        password,
      })

      const currentRequestStep =
        useClientRequestStore.getState().getActiveRequest()?.data?.paso_actual
      router.push(resolvePostLoginRoute(currentRequestStep))
    } catch (err) {
      if (isApiClientError(err)) {
        const rawType =
          typeof (err.data as { __type?: unknown })?.__type === 'string'
            ? String((err.data as { __type?: string }).__type)
            : ''

        if (rawType.includes('NotAuthorizedException')) {
          setError('Correo o contraseña incorrectos.')
        } else if (rawType.includes('UserNotFoundException')) {
          setError('No encontramos una cuenta con ese correo electrónico.')
        } else if (rawType.includes('UserNotConfirmedException')) {
          setError('Tu cuenta aún no está confirmada.')
        } else {
          setError(err.apiDetail || err.apiMessage || err.apiError || err.message)
        }
      } else {
        setError('No fue posible iniciar sesión. Intenta nuevamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <WrapperCard>
      <div className="flex flex-col gap-2">
        <TitleCard>Ingresa a tu cuenta</TitleCard>
        <SubtitleCard>Consulta el estado de tu solicitud activa.</SubtitleCard>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-email" className="text-sm font-medium text-foreground">
              Correo electrónico
            </label>
            <input
              id="login-email"
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
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="login-password" className="text-sm font-medium text-foreground">
                Contraseña
              </label>
              <ButtonCard
                variant="text"
                onClick={() => {
                  setError('')
                  router.push(ROUTES.AUTH.RECOVER_REQUEST)
                }}
              >
                Olvidé mi contraseña
              </ButtonCard>
            </div>

            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-accent focus:ring-2 focus:ring-accent/20 bg-background ${error ? 'border-destructive' : 'border-border'}`}
              />
              <TogglePasswordVisibility
                visible={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
                label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <div className="flex flex-col gap-3">
            <ButtonCard submit disabled={loading} loading={loading} loadingText="Iniciando sesión...">
              Iniciar sesión
            </ButtonCard>
            <ButtonCard
              variant="secondary"
              disabled={loading}
              onClick={() => {
                router.push(ROUTES.ONBOARDING.CURP_VERIFICATION)
              }}
            >
              Crear cuenta
            </ButtonCard>
          </div>
        </div>
      </form>
    </WrapperCard>
  )
}
