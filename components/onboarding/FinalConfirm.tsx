'use client'

import { useState } from 'react'
import { ButtonCard, SubtitleCard, TitleCard, WrapperCard } from '../common'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'
import { Check } from '@/lib/icons'
import { updateActiveRequestData } from '@/services/client-requests'
import { useClientRequestStore } from '@/stores'


export default function FinalConfirm() {
  const router = useRouter()

  const activeRequest = useClientRequestStore((state) => state.getActiveRequest())

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const startDate = new Date()
  startDate.setDate(startDate.getDate() + 7)
  const formattedStart = startDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })

  const handleConfirm = async () => {
    const nextStep = ROUTES.ONBOARDING.TERMS_ACCEPTANCE
    try {
      setLoading(true)
      setError('')

      await updateActiveRequestData({ paso_actual: nextStep })

      router.push(nextStep)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar el paso actual. Intenta nuevamente.',
      )
    } finally {
      setLoading(false)
    }
  }

  const details = [
    {
      label: 'Monto solicitado',
      value: `${Number(activeRequest?.data.monto_solicitado).toLocaleString('es-MX')} MXN`,
    },
    {
      label: 'Pago quincenal',
      value: `${(847).toLocaleString('es-MX')} MXN`,
    },
    {
      label: 'Plazo',
      value: `${activeRequest?.data.plazo} meses`,
    },
    {
      label: 'Seguro',
      value: activeRequest?.data.tipo_de_credito
    },
    {
      label: 'Fecha de inicio',
      value: formattedStart,
    },
  ];

  return (
    <WrapperCard>
      <div className="flex flex-col gap-2">
        <TitleCard>
          Confirmación final
        </TitleCard>
        <SubtitleCard>
          Revisa los datos finales y confirma tu solicitud de crédito.
        </SubtitleCard>
      </div>

      {/* Final card */}
      <div className="rounded-2xl overflow-hidden border border-border">
        <div className="px-5 py-4 flex flex-col items-center gap-2 text-center bg-brand-dark">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-accent">
            <Check className="stroke-white w-6 h-6" />
          </div>
          <span className="text-white font-semibold text-base">Solicitud lista para confirmar</span>
        </div>
        <div className="divide-y divide-border">
          {details.map((d) => (
            <div key={d.label} className="flex items-center justify-between px-5 py-3.5">
              <span className="text-sm text-muted-foreground">{d.label}</span>
              <span className="text-sm font-semibold text-foreground text-right max-w-[55%]">{d.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <ButtonCard
          onClick={handleConfirm}
          disabled={loading}
          loading={loading}
        >
          Confirmar solicitud
        </ButtonCard>
        <ButtonCard
          variant='secondary'
          onClick={() => router.push(ROUTES.ONBOARDING.CREDIT_SELECTION)}
          disabled={loading}
        >
          Regresar
        </ButtonCard>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </WrapperCard>
  )
}
