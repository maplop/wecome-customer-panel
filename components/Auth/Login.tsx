
'use client'

import { useState } from 'react'
import { WrapperCard, TitleCard, SubtitleCard, TogglePasswordVisibility, ButtonCard } from "@/components/common"
import { ROUTES } from "@/lib/routes"
import { useRouter } from "next/navigation"

export default function Login() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
  }


  return (
    <WrapperCard>
      <div className="flex flex-col gap-2">
        <TitleCard>
          Ingresa a tu cuenta
        </TitleCard>
        <SubtitleCard>
          Consulta el estado de tu solicitud activa.
        </SubtitleCard>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-5">

          {successMessage && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
              {successMessage}
            </div>
          )}

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
              onChange={e => {
                setEmail(e.target.value)
                setError('')
                setSuccessMessage('')
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
                  setSuccessMessage('')
                  router.push(ROUTES.AUTH.RECOVER_REQUEST)
                }}
              >
                Olvide mi contraseña
              </ButtonCard>
            </div>

            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={e => {
                  setPassword(e.target.value)
                  setError('')
                  setSuccessMessage('')
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
            <ButtonCard
              submit
              disabled={loading}
              loading={loading}
              loadingText="Iniciando sesion..."
            >
              Iniciar sesion
            </ButtonCard>
            <ButtonCard
              variant="secondary"
              disabled={loading}
              onClick={() => {
                router.push(ROUTES.ONBOARDING.CURP_VERIFICATION)
              }}
            >
              Ya tengo una cuenta
            </ButtonCard>
          </div>
        </div>
      </form>
    </WrapperCard>
  )
}
