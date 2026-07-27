'use client'

import { useState } from 'react'
import { useClientDataStore } from '@/stores'
import { formatMoney, formatMxPhoneNumber } from '@/utils/formatters'
import { ButtonCard, SubtitleCard, TitleCard, WrapperCard, InfoNote } from '../common'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'
import { updateActiveRequestData } from '@/services/client-requests'

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

  const { client } = useClientDataStore()
  const clientData = client?.pii

  if (!clientData) {
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

  const nombreCompleto = `${clientData?.name} ${clientData.apellido_paterno} ${clientData.motherlastname}`.trim()
  const edad = clientData.birthdate
    ? new Date().getFullYear() - new Date(clientData.birthdate).getFullYear()
    : ''

  const handleContinue = async () => {
    const nextStep = ROUTES.ONBOARDING.UPLOAD_DOCUMENTS

    try {
      setIsSubmitting(true)
      setSubmitError(null)

      await updateActiveRequestData({
        paso_actual: nextStep,
      })

      router.push(nextStep)
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
        <DataRow label="RFC" value={clientData.rfc} />
        <DataRow label="CURP" value={clientData.curp} />
        <DataRow label="Nacionalidad" value={clientData.nationality} />
        <DataRow label="Empresa" value={clientData.empresa_donde_trabaja} />
        <DataRow label="Ocupación" value={clientData.cargo_en_empresa} />
        <DataRow label="Salario" value={`${formatMoney(Number(clientData.sueldo_bruto))} MXN`} />
        <DataRow label="Antigüedad" value={clientData.antiguedad_laboral___empresarial.split(' y ').filter(p => /\d/.test(p)).join(' y ')} />
        <DataRow label="Teléfono" value={formatMxPhoneNumber(clientData.phone)} />
        <DataRow label="Correo electrónico" value={clientData.email} />
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
      </div>
    </WrapperCard>
  )
}


