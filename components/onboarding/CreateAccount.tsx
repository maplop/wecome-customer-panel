'use client'

import { useEffect, useMemo, useState } from 'react'
import { isApiClientError } from '@/api/dynamicore/frontend'
import { registerAndLogin } from '@/services/auth'
import { addRequest, updateActiveRequestData } from '@/services/client-requests'
import { updateClientData } from '@/services/client-data'
import { WrapperCard, ButtonCard, TitleCard, SubtitleCard, TogglePasswordVisibility } from '../common'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'
import { useClientProfileStore } from '@/stores/client-profile-store'
import { useClientDataStore } from '@/stores/client-data-store'
import { useClientRequestStore } from '@/stores/client-request-store'
import { evaluatePasswordStrength } from '@/utils/password-strength'

interface FormState {
  email: string
  password: string
  confirm: string
}

const DEFAULT_REQUEST_FORM_ID = '859'

export default function CreateAccount() {
  const router = useRouter()
  const { data } = useClientProfileStore()

  const email = data?.correo_electronico || ''

  const [form, setForm] = useState<FormState>({ email: email, password: '', confirm: '' })
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const { score, label: strengthLabel, color: strengthColor } = useMemo(
    () => evaluatePasswordStrength(form.password),
    [form.password],
  )

  useEffect(() => {
    setForm((prev) => ({ ...prev, email: email }))
  }, [email])

  const validate = () => {
    const e: Partial<FormState> = {}

    if (!form.email) e.email = 'No se encontró un correo de lista blanca. Regresa e intenta nuevamente.'
    if (!form.password) e.password = 'Ingresa una contraseña'
    else if (form.password.length < 8) e.password = 'Mínimo 8 caracteres'

    if (!form.confirm) e.confirm = 'Confirma tu contraseña'
    else if (form.confirm !== form.password) e.confirm = 'Las contraseñas no coinciden'

    return e
  }

  const nombresSeparados = data?.nombres?.trim().split(/\s+/).filter(Boolean) ?? []
  const primerNombre = nombresSeparados[0] ?? ''
  const segundoNombre = nombresSeparados.length > 1
    ? nombresSeparados.slice(1).join(' ')
    : ''

  const handleSubmit = async (e: React.FormEvent) => {
    const nextStep = ROUTES.ONBOARDING.PERSONAL_DATA

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

      const createdClientId = Number(useClientDataStore.getState().client?.id || 0)
      if (createdClientId > 0) {
        const createdRequest = await addRequest({
          form_id: DEFAULT_REQUEST_FORM_ID,
          client: createdClientId,
          enabled: 1,
          data: {},
        })

        if (!createdRequest?.id) {
          throw new Error('No se pudo crear la solicitud inicial del cliente.')
        }

        useClientRequestStore.getState().upsertRequest(createdRequest, true)
      } else {
        throw new Error('No se pudo resolver el cliente para crear la solicitud inicial.')
      }

      await updateClientData({
        pii: {
          name: primerNombre,
          secondname: segundoNombre,
          apellido_paterno: data?.primer_apellido,
          motherlastname: data?.segundo_apellido,
          email: data?.correo_electronico,
          phone: data?.telefono,
          curp: data?.curp,
          rfc: data?.rfc,
          birthdate: data?.fecha_de_nacimiento?.split('T')[0],
          fullname: `${data?.nombres} ${data?.primer_apellido} ${data?.segundo_apellido}`.trim(),
          edad: data?.edad,
          nationality: data?.nacionalidad,
          empresa_donde_trabaja: data?.empresa_afiliada,
          sueldo_bruto: data?.sueldo_bruto_mensual,
          salario: data?.sueldo_bruto_mensual,
          cargo_en_empresa: data?.ocupacion,
          antiguedad_laboral___empresarial: [data?.antiguedad_laboral_anos ? `${data.antiguedad_laboral_anos} años` : '', data?.antiguedad_laboral_meses ? `${data.antiguedad_laboral_meses} meses` : ''].filter(Boolean).join(' y '),
          anios_trabajados: data?.antiguedad_laboral_anos,
          antiguedad_empresa_anios: data?.antiguedad_empresa_anos,
          vacaciones_pendientes_dias: data?.vacaciones_pendientes_dias,
          aguinaldo_proporcional: data?.aguinaldo_proporcional,
          historial_crediticio: data?.historial_crediticio,
          actividad_economica: data?.actividad_economica,
          nivel_de_estudio: data?.nivel_de_estudios,
          numero_de_identificacion: data?.numero_identificacion_oficial,
          tipo_de_identificacion: data?.tipo_identificacion_oficial,
        },
      })

      await updateActiveRequestData({
        paso_actual: nextStep,
      })

      router.push(nextStep)
    } catch (error) {
      if (isApiClientError(error)) {
        if (
          error.apiError === 'UsernameExistsException' ||
          (error.status === 409 && error.apiDetail === 'El usuario ya existe')
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
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full transition-all"
                      style={{ backgroundColor: i <= score ? strengthColor : 'var(--brand-inactive)' }}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium" style={{ color: strengthColor }}>
                  {strengthLabel}
                </span>
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
        </div>
      </form>
    </WrapperCard>
  )
}
