'use client'

import { useClientVerificationStore } from '@/stores/client-store'
import { formatMxPhoneNumber } from '@/utils/phone'
import { ButtonCard, SubtitleCard, TitleCard, WrapperCard } from './common'

interface PersonalDataProps {
  onNext: () => void
  onBack: () => void
}

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

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function PersonalData({ onNext, onBack }: PersonalDataProps) {
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
          onClick={onBack}
          className="w-full rounded-xl border border-border py-3.5 text-sm font-medium text-foreground transition hover:bg-secondary active:scale-[0.98]"
        >
          Regresar
        </button>
      </div>
    )
  }

  const nombreCompleto = `${data.nombres} ${data.primer_apellido} ${data.segundo_apellido}`.trim()
  const edad = calculateAge(data.fecha_de_nacimiento)

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
        <DataRow label="Fecha de nacimiento" value={formatDate(data.fecha_de_nacimiento)} />
        <DataRow label="Edad" value={`${edad} años`} />
        <DataRow label="Nacionalidad" value={data.nacionalidad} />
        <DataRow label="Ocupación" value={data.ocupacion} />
        <DataRow label="Actividad económica" value={data.actividad_economica} />
        <DataRow label="Empresa" value={data.empresa} />
        <DataRow label="Teléfono" value={formatMxPhoneNumber(data.telefono)} />
        <DataRow label="Correo electrónico" value={data.correo_electronico} />
      </div>

      <div className="rounded-2xl border border-border bg-secondary/40 p-4 flex gap-3 items-start">
        <span className="mt-0.5 shrink-0" style={{ color: '#E1941F' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        </span>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Esta información ha sido extraída de nuestro registro de entidades confiables. Si no coincide, reporta a soporte.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <ButtonCard
          onClick={onNext}
        >
          Continuar
        </ButtonCard>

        <ButtonCard
          variant="secondary"
          onClick={onBack}
        >
          Regresar
        </ButtonCard>
      </div>
    </WrapperCard>
  )
}
