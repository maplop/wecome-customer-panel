'use client'

import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { ArrowLeft, KeyRound } from '@/lib/icons'
import { useClientDataStore } from "@/stores/client-data-store";
// formatMxPhoneNumber: solo se usaba para el teléfono (no existe en ClientProfileType)
import { formatDateLongEs, formatMoney /*, formatMxPhoneNumber */ } from '@/utils/formatters'
import { ButtonCard } from '@/components/common/ButtonCard'
import { SubtitleCard } from '@/components/common/SubtitleCard'
import { TitleCard } from '@/components/common/TitleCard'
import { WrapperCard } from '@/components/common/WrapperCard'
import { InfoNote } from '@/components/common/InfoNote'

interface DataItemProps {
  label: string
  value: string
}

interface DataSectionProps {
  title: string
  items: DataItemProps[]
}

function DataItem({ label, value }: DataItemProps) {
  return (
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground wrap-break-word">{value || '-'}</p>
    </div>
  )
}

function DataSection({ title, items }: DataSectionProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        {items.map((item) => (
          <DataItem key={`${title}-${item.label}`} label={item.label} value={item.value} />
        ))}
      </div>
    </section>
  )
}

export default function Profile() {
  const router = useRouter()
  const { client } = useClientDataStore()

  const data = client?.pii

  if (!data) {
    return (
      <WrapperCard className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <TitleCard>Mi perfil</TitleCard>
          <SubtitleCard>
            No hay información disponible. Verifica tu CURP para cargar tus datos.
          </SubtitleCard>
        </div>

        <ButtonCard onClick={() => router.push(ROUTES.ONBOARDING.CURP_VERIFICATION)}>
          Ir a verificación de CURP
        </ButtonCard>
      </WrapperCard>
    )
  }

  const nombreCompleto = `${data.name} ${data.apellido_paterno} ${data.motherlastname}`.trim()
  const initials = `${data.name?.[0] ?? ''}${data.apellido_paterno?.[0] ?? ''}`.toUpperCase() || 'U'

  // Solo se muestran los datos que existen tanto en ClientPiiType como en ClientProfileType.
  // Los demás quedan comentados para evitar valores en blanco.

  const personalSection: DataItemProps[] = [
    { label: 'Nombres', value: data.name },
    { label: 'Fecha de nacimiento', value: formatDateLongEs(data.birthdate) },
    { label: 'Primer apellido', value: data.apellido_paterno },
    { label: 'Segundo apellido', value: data.motherlastname },
    //{ label: 'Edad', value: `${data.ag} años` },
    // Sin equivalente en ClientProfileType:
    //{ label: 'Nacionalidad', value: data.nationality },
    //{ label: 'Régimen conyugal', value: data._regimen_conyugal },
  ]

  // Contacto + identificación en una sola tarjeta
  const contactIdSection: DataItemProps[] = [
    { label: 'Correo electrónico', value: data.email },
    { label: 'CURP', value: data.curp },
    // Sin equivalente en ClientProfileType:
    //{ label: 'Teléfono', value: formatMxPhoneNumber(data.phone) },
    // { label: 'Datos de contacto', value: data.con },
    //{ label: 'Domicilio fiscal y particular', value: data.domicilio_fiscal_y_particular },
    //{ label: 'RFC', value: data.rfc },
    //{ label: 'Tipo de identificación oficial', value: data.tipo_de_identificacion },
    //{ label: 'Número de identificación oficial', value: data.numero_de_identificacion },
  ]

  const jobSection: DataItemProps[] = [
    { label: 'Empresa', value: data.empresa_donde_trabaja },
    { label: 'Antigüedad', value: data.antiguedad_laboral___empresarial },
    // Sin equivalente en ClientProfileType:
    //{ label: 'Ocupación', value: data.cargo_en_empresa },
    //{ label: 'Actividad económica', value: data.actividad_economica },
    //{ label: 'Nivel de estudios', value: data.nivel_de_estudio },
  ]

  const salario = data.salario ? formatMoney(Number(data.salario)) : ''

  return (
    <WrapperCard className="flex flex-col gap-6">
      {/* Encabezado + acciones */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <TitleCard>Mi perfil</TitleCard>
          <SubtitleCard>Consulta y valida tu información registrada.</SubtitleCard>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
            Regresar
          </button>
          <button
            type="button"
            onClick={() => router.push(ROUTES.PROFILE.PASSWORD_CHANGE)}
            className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-accent/90"
          >
            <KeyRound className="h-4 w-4 shrink-0" aria-hidden="true" />
            Cambiar contraseña
          </button>
        </div>
      </div>

      {/* Tarjeta de identidad */}
      <div className="flex flex-col gap-4 rounded-2xl bg-brand-dark p-5 text-white sm:flex-row sm:items-center md:p-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-accent text-xl font-bold text-brand-dark">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xl font-bold">{nombreCompleto}</p>
          <p className="mt-1 truncate text-sm text-white/70">{data.email}</p>
        </div>
        <div className="rounded-xl bg-white/10 px-4 py-2.5">
          <p className="text-[11px] uppercase tracking-widest text-white/70">CURP</p>
          <p className="mt-0.5 text-sm font-semibold">{data.curp || '-'}</p>
        </div>
      </div>

      {/* Contenido en dos columnas */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
        <div className="flex flex-col gap-5 lg:col-span-7">
          <DataSection title="Datos personales" items={personalSection} />
          <DataSection title="Contacto e identificación" items={contactIdSection} />
        </div>

        <section className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 md:p-6 lg:col-span-5">
          <h2 className="text-base font-semibold text-foreground">Información laboral</h2>

          <div className="rounded-xl bg-brand-accent/10 p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Salario</p>
            <p className="mt-1.5 text-3xl font-bold text-foreground">
              {salario || '-'}
              {salario && (
                <span className="ml-2 text-sm font-semibold text-muted-foreground">MXN</span>
              )}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {jobSection.map((item) => (
              <div
                key={`job-${item.label}`}
                className="flex items-start justify-between gap-4 border-b border-border pb-4 last:border-b-0 last:pb-0"
              >
                <p className="pt-0.5 text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                <p className="min-w-0 text-right text-sm font-medium text-foreground wrap-break-word">
                  {item.value || '-'}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </WrapperCard>
  )
}
