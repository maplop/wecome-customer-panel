'use client'

import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { useClientDataStore } from "@/stores/client-data-store";
import { formatDateLongEs, formatMxPhoneNumber } from '@/utils/formatters'
import { ButtonCard, SubtitleCard, TitleCard, WrapperCard, InfoNote } from '@/components/common'

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
    <div className="rounded-xl border border-border bg-background px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground wrap-break-word">{value || '-'}</p>
    </div>
  )
}

function DataSection({ title, items }: DataSectionProps) {
  return (
    <section className="rounded-2xl border border-border bg-secondary/30 p-4 md:p-5">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
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

  const personalSection: DataItemProps[] = [
    { label: 'Nombres', value: data.name },
    { label: 'Primer apellido', value: data.apellido_paterno },
    { label: 'Segundo apellido', value: data.motherlastname },
    { label: 'Fecha de nacimiento', value: formatDateLongEs(data.birthdate) },
    //{ label: 'Edad', value: `${data.ag} años` },
    { label: 'Nacionalidad', value: data.nationality },
    //{ label: 'Régimen conyugal', value: data._regimen_conyugal },
  ]

  const contactSection: DataItemProps[] = [
    { label: 'Correo electrónico', value: data.email },
    { label: 'Teléfono', value: formatMxPhoneNumber(data.phone) },
    // { label: 'Datos de contacto', value: data.con },
    //{ label: 'Domicilio fiscal y particular', value: data.domicilio_fiscal_y_particular },
  ]

  const officialSection: DataItemProps[] = [
    { label: 'CURP', value: data.curp },
    { label: 'RFC', value: data.rfc },
    { label: 'Tipo de identificación oficial', value: data.tipo_de_identificacion },
    { label: 'Número de identificación oficial', value: data.numero_de_identificacion },
  ]

  const jobSection: DataItemProps[] = [
    { label: 'Empresa', value: data.empresa_donde_trabaja },
    { label: 'Ocupación', value: data.cargo_en_empresa },
    { label: 'Actividad económica', value: data.actividad_economica },
    { label: 'Nivel de estudios', value: data.nivel_de_estudio },
    { label: 'Antigüedad', value: data.antiguedad_laboral___empresarial },
    { label: 'Salario', value: `${Number(data.salario).toLocaleString("es-MX")} MXN` },
  ]

  return (
    <WrapperCard className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <TitleCard>Mi perfil</TitleCard>
        <SubtitleCard>Consulta y valida tu información registrada.</SubtitleCard>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr]">
        <aside className="rounded-2xl border border-border bg-secondary/30 p-5 flex flex-col gap-4 h-fit">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-brand-dark text-white flex items-center justify-center text-base font-semibold">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{nombreCompleto}</p>
              <p className="text-xs text-muted-foreground truncate">{data.email}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">CURP</p>
            <p className="mt-1 text-sm font-medium text-foreground">{data.curp}</p>
          </div>

          <div className="rounded-xl border border-border bg-background px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">RFC</p>
            <p className="mt-1 text-sm font-medium text-foreground">{data.rfc}</p>
          </div>

          <div className="flex flex-col gap-3 pt-1">
            <ButtonCard onClick={() => router.push(ROUTES.PROFILE.PASSWORD_CHANGE)}>
              Cambiar contraseña
            </ButtonCard>
            <ButtonCard variant="secondary" onClick={() => router.back()}>
              Regresar
            </ButtonCard>
          </div>
        </aside>

        <div className="flex flex-col gap-4">
          <DataSection title="Datos personales" items={personalSection} />
          <DataSection title="Contacto y domicilio" items={contactSection} />
          <DataSection title="Identificación oficial" items={officialSection} />
          <DataSection title="Información laboral" items={jobSection} />
        </div>
      </div>

      <InfoNote text="Si detectas algún dato incorrecto, por favor contacta a soporte para su actualización." />
    </WrapperCard>
  )
}
