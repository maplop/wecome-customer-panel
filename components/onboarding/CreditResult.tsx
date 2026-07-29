'use client'
import { useState } from 'react'
import { WrapperCard, TitleCard, SubtitleCard, ButtonCard, InfoNote, InfoCard } from '../common'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'
import { Check, CircleDollarSign, Calendar, HandCoins, ShieldCheck } from '@/lib/icons'
import { updateActiveRequestData } from '@/services/client-requests'
import { useClientRequestStore } from '@/stores'
import { formatMoney, formatPaymentFrequency, normalizePaymentFrequency } from '@/utils/formatters'
import { getCreditTypeLabel } from '@/utils/credit-type'

function toPositiveNumber(value: unknown): number | null {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

export default function CreditResult() {
  const router = useRouter()
  const activeRequest = useClientRequestStore((state) => state.getActiveRequest())

  const data = activeRequest?.data ?? {}

  const amount = toPositiveNumber(data.monto_solicitado) ?? 0
  const term = toPositiveNumber(data.plazo_solicitado) ?? 12
  const paymentFrequency = normalizePaymentFrequency(data.frecuencia_de_pago_solicitada)
  const paymentFrequencyLabel = formatPaymentFrequency(paymentFrequency)
  const isProtected = data.tipo_de_credito_solicitado === 'protected'

  const paymentAmount = toPositiveNumber(
    isProtected ? data.pago_por_periodo_con_seguros_iva : data.pago_por_periodo_sin_seguros,
  ) ?? 0
  const totalToPay = toPositiveNumber(data.monto_total_a_pagar) ?? 0

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleContinue = async () => {
    const nextStep = ROUTES.ONBOARDING.CREDIT_AUTHORIZATION
    setIsSubmitting(true)
    setError('')
    try {
      await updateActiveRequestData({ paso_actual: nextStep })
      router.push(nextStep)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo continuar. Intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <WrapperCard>
      <div className="flex flex-col gap-2">
        <TitleCard>Resultado de tu crédito</TitleCard>
        <SubtitleCard>
          Aquí está el resumen del crédito que seleccionaste.
        </SubtitleCard>
      </div>

      {/* Hero */}
      <div className="rounded-2xl p-6 flex flex-col items-center gap-3 text-center bg-brand-dark">
        <div className="flex justify-center items-center w-10 h-10 rounded-full bg-brand-accent">
          <Check className="stroke-brand-dark w-8 h-8" />
        </div>
        <span className="text-xs font-medium text-white/60 uppercase tracking-widest">
          Monto solicitado
        </span>
        <span className="text-4xl font-bold text-white">
          {formatMoney(amount)}
        </span>
        <span className="text-sm text-white/50">MXN</span>
      </div>

      {/* Detalles */}
      <div className="rounded-2xl border border-border bg-secondary/40 p-4 flex flex-col gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Detalles del crédito
          </p>
          <div className="grid grid-cols-2 gap-3">

            <InfoCard
              icon={CircleDollarSign}
              label={paymentFrequency}
              value={formatMoney(paymentAmount)}
            />

            <InfoCard
              icon={HandCoins}
              label="Total a pagar"
              value={formatMoney(totalToPay)}
            />

            <InfoCard
              icon={Calendar}
              label="Frecuencia"
              value={paymentFrequencyLabel}
              valueSize="sm"
            />

            <InfoCard
              icon={Calendar}
              label="Plazo"
              value={`${term} meses`}
              valueSize="sm"
            />

            <InfoCard
              icon={CircleDollarSign}
              label="Tasa mensual"
              value={`${data.tasa_mensual_sin_iva ?? 4}%`}
              valueSize="sm"
            />

            <InfoCard
              icon={ShieldCheck}
              label="Tipo"
              value={getCreditTypeLabel(data.tipo_de_credito_solicitado)}
              valueSize="sm"
              valueClassName="truncate"
            />

          </div>
        </div>
      </div>

      <InfoNote text="Los valores mostrados son estimados y podrán ajustarse según el análisis y la validación de la solicitud de crédito." />

      <div className="flex flex-col gap-3">
        <ButtonCard
          onClick={handleContinue}
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          Continuar
        </ButtonCard>
        <ButtonCard
          variant="secondary"
          disabled={isSubmitting}
          onClick={() => router.push(ROUTES.ONBOARDING.CREDIT_SELECTION)}
        >
          Regresar
        </ButtonCard>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </WrapperCard>
  )
}
