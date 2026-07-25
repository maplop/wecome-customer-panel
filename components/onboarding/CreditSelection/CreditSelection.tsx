'use client'

import { useState, useEffect } from 'react'
import { ButtonCard, SubtitleCard, TitleCard, WrapperCard } from '../../common'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'
import { updateActiveRequestData } from '@/services/client-requests'
import { evaluateScore } from '@/services/onboarding/evaluate-score'
import { useClientRequestStore, useClientDataStore } from '@/stores'
import RiskModal from './RiskModal'
import { formatMoney, normalizePaymentFrequency } from '@/utils/formatters'
import { normalizeCreditType } from '@/utils/credit-type'
import { Shield, ShieldCheck } from '@/lib/icons'


const TERMS = [12, 24]
const MIN_AMOUNT = 10000
const MAX_AMOUNT_CAP = 250000
const PAYMENT_FREQUENCIES = ['QUINCENAL', 'MENSUAL'] as const

function toPositiveNumber(value: unknown): number | null {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}


export default function CreditSelection() {
  const router = useRouter()
  const activeRequest = useClientRequestStore((state) => state.getActiveRequest())
  const requestData = activeRequest?.data ?? {}

  const { client } = useClientDataStore()
  const salary = client?.pii?.salario ?? 0

  // 1️⃣ term primero porque maxAmount depende de él
  const resolvedTerm = (() => {
    const parsed = Number(requestData.plazo_solicitado)
    return TERMS.includes(parsed) ? parsed : TERMS[0]
  })()

  const [term, setTerm] = useState(resolvedTerm)

  const resolvedPaymentFrequency = normalizePaymentFrequency(requestData.frecuencia_de_pago_solicitada)

  const [paymentFrequency, setPaymentFrequency] = useState<'QUINCENAL' | 'MENSUAL'>(resolvedPaymentFrequency)

  // 2️⃣ maxAmount depende de term
  const salaryNum = toPositiveNumber(salary) ?? 0
  const paymentCapacity = salaryNum * 0.33          // 33% del salario mensual
  const maxFromSalary = paymentCapacity * term       // capacidad mensual × meses del plazo
  const minAmount = MIN_AMOUNT
  const maxAmount = Math.min(MAX_AMOUNT_CAP, Math.max(MIN_AMOUNT, Math.round(maxFromSalary)))

  // 3️⃣ resolvedAmount depende de maxAmount
  const resolvedType = normalizeCreditType(requestData.tipo_de_credito_solicitado) ?? 'protected'
  const requestedAmount = toPositiveNumber(requestData.monto_solicitado)
  const resolvedAmount = Math.min(
    maxAmount,
    Math.max(minAmount, Math.round(requestedAmount ?? maxAmount / 2)),
  )

  const [amount, setAmount] = useState(resolvedAmount)
  const [hasInsurance, setHasInsurance] = useState<'protected' | 'esencial'>(resolvedType)
  const [showRiskModal, setShowRiskModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // clamp amount si cambia el plazo
  useEffect(() => {
    setAmount((prev) =>
      Math.max(minAmount, Math.min(prev, maxAmount))
    )
  }, [minAmount, maxAmount])

  useEffect(() => {
    setAmount(resolvedAmount)
    setTerm(resolvedTerm)
    setHasInsurance(resolvedType)
    setPaymentFrequency(resolvedPaymentFrequency)
  }, [])

  useEffect(() => {
    document.body.style.overflow = showRiskModal ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showRiskModal])


  const pct = maxAmount === minAmount ? 100 : ((amount - minAmount) / (maxAmount - minAmount)) * 100

  const handleInsuranceClick = (value: boolean) => {
    if (!value) {
      setShowRiskModal(true)
    } else {
      setShowRiskModal(false)
      setHasInsurance('protected')
    }
  }

  const handleRiskAccept = () => {
    setHasInsurance('esencial')
    setShowRiskModal(false)
  }

  const handleRiskCancel = () => {
    setShowRiskModal(false)
  }

  const handleAmountChange = (value: number) => {
    if (Number.isNaN(value)) return

    const clamped = Math.max(
      minAmount,
      Math.min(maxAmount, Math.round(value))
    )

    setAmount(clamped)
  }

  const parseFormattedAmount = (text: string): number | null => {
    // Remover espacios y comas
    const cleaned = text.replace(/[\s,]/g, '')
    const parsed = Number(cleaned)
    return Number.isFinite(parsed) ? parsed : null
  }

  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permitir números, espacios y comas
    const filtered = e.target.value.replace(/[^\d\s,]/g, '')
    const parsed = parseFormattedAmount(filtered)
    if (parsed !== null) {
      handleAmountChange(parsed)
    }
  }

  const handleAmountInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const parsed = parseFormattedAmount(e.target.value)
    if (parsed !== null) {
      handleAmountChange(parsed)
    }
  }

  const handleContinue = async () => {
    const nextStep = ROUTES.ONBOARDING.CREDIT_RESULT
    setIsSubmitting(true)
    setError('')
    try {
      // 1. Evaluar el score primero
      const scoreResult = await evaluateScore({
        action: 'evaluate',
        employer_id: String(client?.id ?? ''),
        employee_key: client?.pii?.rfc ?? '',
        monto_solicitado: amount,
        plazo_meses: term,
        periodicidad: paymentFrequency,
      })

      // Guard: si no hay resultado, no continuamos
      if (!scoreResult) {
        throw new Error('No se pudo obtener el resultado de la evaluación.')
      }

      // 2. Guardar en un solo request: datos elegidos por el usuario + resultado del score
      await updateActiveRequestData({
        // Datos de la solicitud del usuario
        monto_solicitado: amount,
        tipo_de_credito_solicitado: hasInsurance === 'protected' ? 'protected' : 'esencial',
        plazo_solicitado: term,
        frecuencia_de_pago_solicitada: paymentFrequency === 'QUINCENAL' ? 1 : 2,
        paso_actual: nextStep,

        // Resultado del score
        perfil: scoreResult.perfil,
        historial_crediticio_usado: scoreResult.historial_crediticio_usado ?? undefined,
        score_consolidado: String(scoreResult.score_consolidado),
        score_ajustado: String(scoreResult.score_ajustado),
        probabilidad_rotacion_promedio: String(scoreResult.probabilidad_rotacion_promedio),
        sueldo_neto_mensual: scoreResult.sueldo_neto_mensual,
        capacidad_endeudamiento_max: scoreResult.capacidad_endeudamiento_max,
        tasa_mensual_sin_iva: parseFloat(scoreResult.tasa_mensual_sin_iva),
        seguro_vida: scoreResult.seguro_vida_al_millar,
        seguro_invalidez_total_permanente: scoreResult.seguro_invalidez_al_millar,
        comision_apertura: scoreResult.comision_apertura,
        pago_por_periodo_sin_seguros: scoreResult.pago_por_periodo_sin_seguros,
        pago_por_periodo_con_seguros_iva: scoreResult.pago_por_periodo_con_seguros_iva,
        numero_de_periodos: scoreResult.numero_de_periodos,
        monto_total_a_pagar: scoreResult.monto_total_a_pagar,
        evaluation_id: scoreResult.evaluation_id,
      })

      router.push(nextStep)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo completar la evaluación. Intenta nuevamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <WrapperCard>
        <div className="flex flex-col gap-2">
          <TitleCard>
            Elige tu crédito
          </TitleCard>
          <SubtitleCard>
            Ajusta el monto y el plazo de acuerdo a tus necesidades.
          </SubtitleCard>
        </div>

        {/* Info salario */}
        {salaryNum > 0 && (
          <div className="flex justify-between items-center gap-1 rounded-xl border border-border bg-secondary/40 p-3 text-center">
            <span className="text-xs text-muted-foreground leading-tight">Salario mensual registrado</span>
            <span className="text-sm font-semibold text-foreground">
              {formatMoney(salaryNum)} MXN
            </span>
          </div>
        )}

        {/* Amount slider */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm font-medium text-foreground">
                Monto del crédito
              </label>

              <div className="flex items-center gap-2 relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatMoney(amount)}
                  onChange={handleAmountInputChange}
                  onBlur={handleAmountInputBlur}
                  className="w-full py-2 text-right text-sm font-semibold text-foreground outline-none focus:border-brand-accent"
                />
                <label className="text-sm font-medium  text-muted-foreground">
                  MXN
                </label>
              </div>


            </div>
            <div className="relative py-2">
              <input
                type="range"
                min={minAmount}
                max={maxAmount}
                step={1}
                value={amount}
                onChange={(e) => handleAmountChange(Number(e.target.value))}
                className="w-full appearance-none h-2 rounded-full outline-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--brand-accent) 0%, var(--brand-accent) ${pct}%, var(--brand-inactive) ${pct}%, var(--brand-inactive) 100%)`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>${formatMoney(minAmount)}</span>
              <span>${formatMoney(maxAmount)}</span>
            </div>
          </div>

          {/* Plazo + Frecuencia de pago, lado a lado */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground">Plazo</label>
              <div className="flex rounded-xl bg-secondary p-1">
                {TERMS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTerm(t)}
                    className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${term === t
                      ? 'bg-brand-dark text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    {t} meses
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground">Frecuencia de pago</label>
              <div className="flex rounded-xl bg-secondary p-1">
                {PAYMENT_FREQUENCIES.map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setPaymentFrequency(freq)}
                    className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${paymentFrequency === freq
                      ? 'bg-brand-dark text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    {freq === 'QUINCENAL' ? 'Quincenal' : 'Mensual'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Insurance toggle */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-foreground">
              Tipo de crédito
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleInsuranceClick(true)}
                className={`relative rounded-xl p-4 text-left transition active:scale-[0.98] ${hasInsurance === 'protected'
                  ? 'border-2 border-brand-accent bg-brand-accent/10'
                  : 'border border-brand-accent/25 bg-white'
                  }`}
              >
                <ShieldCheck
                  className={`absolute top-3 right-3 h-5 w-5 ${hasInsurance === 'protected'
                    ? 'text-brand-accent'
                    : 'text-muted-foreground/50'
                    }`}
                />

                <span
                  className={`block text-sm font-semibold ${hasInsurance === 'protected'
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                    }`}
                >
                  Protegido
                </span>

                <span
                  className={`block text-xs mt-0.5 ${hasInsurance === 'protected'
                    ? 'text-brand-accent font-medium'
                    : 'text-muted-foreground'
                    }`}
                >
                  Con seguro incluido
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleInsuranceClick(false)}
                className={`relative rounded-xl p-4 text-left transition active:scale-[0.98] ${hasInsurance === 'esencial'
                  ? 'border-2 border-brand-accent bg-brand-accent/10'
                  : 'border border-brand-accent/25 bg-white'
                  }`}
              >
                <Shield
                  className={`absolute top-3 right-3 h-5 w-5 ${hasInsurance === 'esencial'
                    ? 'text-brand-accent'
                    : 'text-muted-foreground/50'
                    }`}
                />

                <span
                  className={`block text-sm font-semibold ${hasInsurance === 'esencial'
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                    }`}
                >
                  Esencial
                </span>

                <span
                  className={`block text-xs mt-0.5 ${hasInsurance === 'esencial'
                    ? 'text-brand-accent font-medium'
                    : 'text-muted-foreground'
                    }`}
                >
                  Sin seguro
                </span>
              </button>
            </div>
          </div>

          {/*
                    <div className="grid grid-cols-3 divide-x divide-border border-t border-border pt-4 mt-3">
            {[
              { label: 'Tasa mensual', value: '4.0%' },
              { label: 'Apertura', value: '3.0%' },
              { label: 'Sin aval', value: '100%' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1 px-2 text-center">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <span className="text-base font-bold text-brand-accent">{item.value}</span>
              </div>
            ))}
          </div>
          */}

          <div className="flex flex-col gap-3 mt-3">
            <ButtonCard
              onClick={handleContinue}
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              Continuar con mi crédito
            </ButtonCard>
            <ButtonCard
              variant="secondary"
              disabled={isSubmitting}
              onClick={() => router.push(ROUTES.ONBOARDING.UPLOAD_DOCUMENTS)}
            >
              Regresar
            </ButtonCard>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </div>
      </WrapperCard>

      {showRiskModal && (
        <RiskModal
          onAccept={handleRiskAccept}
          onCancel={handleRiskCancel}
        />
      )}
    </>
  )
}
