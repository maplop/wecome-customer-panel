'use client'
import { useState } from 'react'
import { WrapperCard, TitleCard, SubtitleCard, ButtonCard, InfoNote } from '../common'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'
import { Check } from '@/lib/icons'
import { updateActiveRequestData } from '@/services/client-requests'
import { useClientRequestStore } from '@/stores'
import { formatMoney } from '@/utils/formatters'

const MONTHLY_RATE = 0.04
const ANNUAL_RATE = MONTHLY_RATE * 12
const INSURANCE_RATE = 0.02

function toPositiveNumber(value: unknown): number | null {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

export default function CreditResult() {
  const router = useRouter()
  const activeRequest = useClientRequestStore((state) => state.getActiveRequest())

  const data = activeRequest?.data ?? {}

  const amount = toPositiveNumber(data.monto_solicitado) ?? 0
  const term = toPositiveNumber(data.plazo) ?? 12
  const isProtected = data.tipo_de_credito === 'Protegido'

  const totalInterest = amount * MONTHLY_RATE * term
  const insuranceTotal = isProtected ? amount * INSURANCE_RATE : 0
  const totalToPay = amount + totalInterest + insuranceTotal
  const biweeklyPayment = totalToPay / (term * 2)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleContinue = async () => {
    const nextStep = ROUTES.ONBOARDING.FINAL_CONFIRM
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

      {/* Hero — monto solicitado */}
      <div className="rounded-2xl p-6 flex flex-col items-center gap-3 text-center bg-brand-dark">
        <span className="text-xs font-medium text-white/60 uppercase tracking-widest">
          Monto solicitado
        </span>
        <span className="text-4xl font-bold text-white">
          {formatMoney(amount)}
        </span>
        <span className="text-sm text-white/50">MXN</span>
        <div className="flex items-center gap-1.5">
          <Check className="stroke-brand-success-light w-4 h-4" />
          <span className="text-xs text-white/70">Preaprobado al instante</span>
        </div>
      </div>

      {/* Detalles del crédito */}
      <div className="rounded-2xl border border-border bg-secondary/40 p-4 flex flex-col gap-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Detalle del crédito
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Pago quincenal</p>
            <p className="text-sm font-semibold text-foreground">
              {formatMoney(biweeklyPayment)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total a pagar</p>
            <p className="text-sm font-semibold text-foreground">
              {formatMoney(totalToPay)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Plazo</p>
            <p className="text-sm font-semibold text-foreground">{term} meses</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tasa anual</p>
            <p className="text-sm font-semibold text-foreground">
              {(ANNUAL_RATE * 100).toFixed(0)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tipo</p>
            <p className="text-sm font-semibold text-foreground">
              {data.tipo_de_credito ?? '—'}
            </p>
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
