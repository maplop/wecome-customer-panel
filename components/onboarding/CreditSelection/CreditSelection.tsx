'use client'

import { useState, useEffect } from 'react'
import { ButtonCard, SubtitleCard, TitleCard, WrapperCard } from '../../common'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'
import { updateActiveRequestData } from '@/services/client-requests'
import { useClientRequestStore } from '@/stores'
import { useClientDataStore } from '@/stores'
import RiskModal from './RiskModal'
import { formatMoney } from '@/utils/formatters'


const TERMS = [12, 18]
const MIN_AMOUNT = 10000
const MAX_AMOUNT_CAP = 250000

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
    const parsed = Number(requestData.plazo)
    return TERMS.includes(parsed) ? parsed : TERMS[0]
  })()

  const [term, setTerm] = useState(resolvedTerm)

  // 2️⃣ maxAmount depende de term
  const salaryNum = toPositiveNumber(salary) ?? 0
  const paymentCapacity = (salaryNum * 0.33) / 2
  const maxFromSalary = paymentCapacity * (term * 2)
  const minAmount = MIN_AMOUNT
  const maxAmount = Math.min(MAX_AMOUNT_CAP, Math.max(MIN_AMOUNT, Math.round(maxFromSalary)))

  // 3️⃣ resolvedAmount depende de maxAmount
  const resolvedType = requestData.tipo_de_credito === 'esencial' ? 'esencial' : 'protected'
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
      await updateActiveRequestData({
        monto_solicitado: amount,
        tipo_de_credito: hasInsurance === 'protected' ? 'Protegido' : 'Esencial',
        monto_maximo_solicitable: maxAmount,
        plazo: String(term),
        paso_actual: nextStep,
      })

      router.push(nextStep)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar el paso actual. Intenta nuevamente.',
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

          {/* Term selection */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Plazo</label>
            <div className="grid grid-cols-2 gap-2">
              {TERMS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTerm(t)}
                  className={`rounded-xl py-2.5 text-sm font-medium transition active:scale-[0.97] ${term === t
                    ? 'bg-brand-dark text-white'
                    : 'border border-border text-foreground hover:bg-secondary'
                    }`}
                >
                  {t} meses
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Insurance toggle */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Tipo de crédito</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleInsuranceClick(true)}
              className={`rounded-xl py-3 px-4 text-sm font-medium transition active:scale-[0.97] text-left flex flex-col gap-0.5 ${hasInsurance === 'protected'
                ? 'bg-brand-dark text-white'
                : 'border border-border text-foreground hover:bg-secondary'
                }`}
            >
              <span className="font-semibold">Protegido</span>
              <span className={`text-xs ${hasInsurance === 'protected' ? 'text-white/70' : 'text-muted-foreground'}`}>Con seguro</span>
            </button>
            <button
              type="button"
              onClick={() => handleInsuranceClick(false)}
              className={`rounded-xl py-3 px-4 text-sm font-medium transition active:scale-[0.97] text-left flex flex-col gap-0.5 ${hasInsurance === 'esencial'
                ? 'bg-brand-dark text-white'
                : 'border border-border text-foreground hover:bg-secondary'
                }`}
            >
              <span className="font-semibold">Esencial</span>
              <span className={`text-xs ${hasInsurance === 'esencial' ? 'text-white/70' : 'text-muted-foreground'}`}>Sin seguro</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Tasa mensual', value: '4.0%' },
            { label: 'Apertura', value: '3.0%' },
            //{ label: 'Plazo máx.', value: '24 meses' },
            { label: 'Sin aval', value: '100%' },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-1 rounded-xl border border-border bg-secondary/40 p-3 text-center">
              <span className="text-xs text-muted-foreground leading-tight">{item.label}</span>
              <span className="text-sm font-semibold text-foreground">{item.value}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
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
