'use client'

import { useEffect, useState } from 'react'

import { isApiClientError } from '@/api/dynamicore/frontend'
import { registerAndLogin } from '@/services/auth'
import { WrapperCard, ButtonCard, TitleCard, SubtitleCard, TogglePasswordVisibility } from '../common'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'
import { useClientVerificationStore } from '@/stores/client-store'

interface FormState {
  email: string
  password: string
  confirm: string
}

export default function CreateAccount() {
  const router = useRouter()
  const { data } = useClientVerificationStore()

  const whitelistEmail = data?.correo_electronico || ''

  const [form, setForm] = useState<FormState>({ email: whitelistEmail, password: '', confirm: '' })
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    setForm((prev) => ({ ...prev, email: whitelistEmail }))
  }, [whitelistEmail])

  const validate = () => {
    const e: Partial<FormState> = {}

    if (!form.email) e.email = 'No se encontró un correo de lista blanca. Regresa e intenta nuevamente.'
    if (!form.password) e.password = 'Ingresa una contraseña'
    else if (form.password.length < 8) e.password = 'Mínimo 8 caracteres'

    if (!form.confirm) e.confirm = 'Confirma tu contraseña'
    else if (form.confirm !== form.password) e.confirm = 'Las contraseñas no coinciden'

    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    setErrors({})
    setSubmitError('')
    setIsSubmitting(true)

    try {
      await registerAndLogin({
        email: form.email,
        password: form.password,
        username: form.email,
      })

      router.push(ROUTES.ONBOARDING.PERSONAL_DATA)
    } catch (error) {
      if (isApiClientError(error)) {
        if (
          error.apiError === 'UsernameExistsException' ||
          (error.status === 409 && error.apiDetail === 'User already exists')
        ) {
          setSubmitError('Ya existe una cuenta registrada con este correo electrónico.')
          return
        }

        setSubmitError(
          error.apiDetail || error.apiMessage || error.apiError || error.message,
        )
        return
      }

      setSubmitError(
        error instanceof Error
          ? error.message
          : 'No se pudo crear la cuenta. Intenta nuevamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const strength = (() => {
    const p = form.password
    if (!p) return 0

    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/\d/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  })()

  const strengthLabel = ['', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte'][strength]
  const strengthColor = ['', 'var(--brand-error)', 'var(--brand-warning)', 'var(--brand-success)', 'var(--brand-strong)'][strength]

  return (
    <WrapperCard>
      <div className="flex flex-col gap-2">
        <TitleCard>
          Crea tu cuenta
        </TitleCard>
        <SubtitleCard>
          Configura tu acceso para gestionar tu crédito en cualquier momento.
        </SubtitleCard>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              readOnly
              className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground cursor-not-allowed opacity-75 outline-none"
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPwd ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={(e) => {
                  setForm((f) => ({ ...f, password: e.target.value }))
                  setErrors((er) => ({ ...er, password: '' }))
                  if (submitError) setSubmitError('')
                }}
                className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 ${errors.password ? 'border-destructive' : 'border-border bg-background'}`}
              />
              <TogglePasswordVisibility
                visible={showPwd}
                onToggle={() => setShowPwd((v) => !v)}
                label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              />
            </div>
            {form.password && (
              <div className="flex items-center gap-2">
                <div className="flex gap-1 flex-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-1 flex-1 rounded-full transition-all" style={{ backgroundColor: i <= strength ? strengthColor : 'var(--brand-inactive)' }} />
                  ))}
                </div>
                <span className="text-xs font-medium" style={{ color: strengthColor }}>{strengthLabel}</span>
              </div>
            )}
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirm" className="text-sm font-medium text-foreground">
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                id="confirm"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repite tu contraseña"
                value={form.confirm}
                onChange={(e) => {
                  setForm((f) => ({ ...f, confirm: e.target.value }))
                  setErrors((er) => ({ ...er, confirm: '' }))
                  if (submitError) setSubmitError('')
                }}
                className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 ${errors.confirm ? 'border-destructive' : 'border-border bg-background'}`}
              />
              <TogglePasswordVisibility
                visible={showConfirm}
                onToggle={() => setShowConfirm((v) => !v)}
                label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              />
            </div>
            {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
          </div>

          {submitError && (
            <p className="text-sm text-destructive">{submitError}</p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <ButtonCard
            variant="primary"
            submit
            disabled={isSubmitting || !form.email}
            loading={isSubmitting}
            loadingText="Creando cuenta..."
          >
            Crear cuenta
          </ButtonCard>
          <ButtonCard
            variant="secondary"
            onClick={() => router.push(ROUTES.ONBOARDING.IDENTITY_VERIFICATION)}
            disabled={isSubmitting}
          >
            Regresar
          </ButtonCard>
          <div className='flex justify-center gap-1.5'>
            <p className="text-sm text-muted-foreground leading-relaxed">
              ¿Ya tienes cuenta?
            </p>
            <ButtonCard
              variant="text"
              onClick={() => router.push(ROUTES.AUTH.LOGIN)}
              disabled={isSubmitting}
            >
              Inicia sesión
            </ButtonCard>
          </div>
        </div>
      </form>
    </WrapperCard>
  )
}
