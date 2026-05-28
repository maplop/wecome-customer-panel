'use client'

import { useState } from 'react'
import { useClientVerificationStore } from '@/stores/client-store'
import { formatMxPhoneNumber } from '@/utils/phone'
import { ButtonCard, SubtitleCard, TitleCard, WrapperCard, InfoNote } from '../common'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'
import { updateCurrentUserClientData } from '@/services/user-client'

interface DataRowProps {
  label: string
  value: string
}

function DataRow({ label, value }: DataRowProps) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  )
}

export default function PersonalData() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { data } = useClientVerificationStore()

  if (!data) {
    return (
      <div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-foreground text-balance">
            Datos personales
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            No hay datos disponibles. Por favor, verifica tu CURP primero.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="w-full rounded-xl border border-border py-3.5 text-sm font-medium text-foreground transition hover:bg-secondary active:scale-[0.98]"
        >
          Regresar
        </button>
      </div>
    )
  }

  const nombreCompleto = `${data.nombres} ${data.primer_apellido} ${data.segundo_apellido}`.trim()
  const nombresSeparados = data.nombres.trim().split(/\s+/).filter(Boolean)
  const primerNombre = nombresSeparados[0] ?? ' '
  const segundoNombre = nombresSeparados.length > 1
    ? nombresSeparados.slice(1).join(' ')
    : ' '

  const handleContinue = async () => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)

      await updateCurrentUserClientData({
        pii: {
          name: primerNombre,
          secondname: segundoNombre,
          apellido_paterno: data.primer_apellido,
          motherlastname: data.segundo_apellido,
          email: data.correo_electronico,
          phone: data.telefono,
          curp: data.curp,
          rfc: data.rfc,
          birthdate: data.fecha_de_nacimiento,
          // age: data.edad,
          nationality: data.nacionalidad,
          //occupation: data.ocupacion,
          //company: data.empresa,
          //salary: data.salario,
          antiguedad_laboral___empresarial: data.antiguedad,
          actividad_economica: data.actividad_economica,
          nivel_de_estudio: data.nivel_de_estudios,
          numero_de_identificacion: data.numero_identificacion_oficial,
          tipo_de_identificacion: data.tipo_identificacion_oficial,
          //fiscal_and_home_address: data.domicilio_fiscal_y_particular,
          //contact_data: data.datos_de_contacto,
        },
        step: ROUTES.ONBOARDING.UPLOAD_DOCUMENTS
      })

      router.push(ROUTES.ONBOARDING.UPLOAD_DOCUMENTS)
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'No se pudieron actualizar tus datos. Intenta nuevamente.'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <WrapperCard className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <TitleCard>
          Datos personales
        </TitleCard>
        <SubtitleCard>
          Verifica que tus datos sean correctos antes de continuar.
        </SubtitleCard>
      </div>

      <div className="rounded-2xl border border-border bg-secondary/30 p-5 flex flex-col gap-1">
        <DataRow label="Nombre completo" value={nombreCompleto} />
        <DataRow label="RFC" value={data.rfc} />
        <DataRow label="CURP" value={data.curp} />

        <DataRow label="Edad" value={`${data.edad} años`} />
        <DataRow label="Nacionalidad" value={data.nacionalidad} />

        <DataRow label="Empresa" value={data.empresa} />
        <DataRow label="Ocupación" value={data.ocupacion} />
        <DataRow label="Salario" value={`${data.salario} MXN`} />
        <DataRow label="Antigüedad" value={data.antiguedad} />

        <DataRow label="Teléfono" value={formatMxPhoneNumber(data.telefono)} />
        <DataRow label="Correo electrónico" value={data.correo_electronico} />
      </div>

      <InfoNote
        text="Esta información ha sido extraída de nuestro registro de entidades confiables. Si no coincide, reporta a soporte."
      />

      {submitError && (
        <p className="text-sm text-red-600">{submitError}</p>
      )}

      <div className="flex flex-col gap-3">
        <ButtonCard
          onClick={handleContinue}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : 'Continuar'}
        </ButtonCard>

        <ButtonCard
          variant="secondary"
          disabled={isSubmitting}
          onClick={() => router.push(ROUTES.ONBOARDING.CREATE_ACCOUNT)}
        >
          Regresar
        </ButtonCard>
      </div>
    </WrapperCard>
  )
}
