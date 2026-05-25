'use client'

import { useState, useEffect } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ButtonCard, SubtitleCard, TitleCard, WrapperCard } from '../common'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'
import { AlertTriangle } from '@/lib/icons'

const TERMS = [6, 12, 18]
const MONTHLY_RATE = 0.028
const INSURANCE_RATE = 0.02

function RiskModal({
  onAccept,
  onCancel,
}: {
  onAccept: () => void
  onCancel: () => void
}) {
  const [checked, setChecked] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-background rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-accent"
            >
              <AlertTriangle className="stroke-white w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Crédito sin seguro</h2>
          </div>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="rounded-xl bg-brand-warning/10 border border-brand-warning/30 p-4 flex flex-col gap-2">
            <p className="text-sm font-semibold text-brand-warning">Aviso importante</p>
            <p className="text-sm text-brand-warning/80 leading-relaxed">
              Al seleccionar un crédito <strong>sin seguro</strong>, asumes los siguientes riesgos:
            </p>
            <ul className="text-sm text-brand-warning/80 space-y-1.5 list-disc list-inside">
              <li>En caso de incapacidad temporal, el pago del crédito sigue siendo tu responsabilidad.</li>
              <li>En caso de fallecimiento, el saldo pendiente será cobrado a tus beneficiarios o avales.</li>
              <li>No cuentas con protección ante pérdida involuntaria de empleo.</li>
              <li>Las tasas de interés pueden ser más altas que en un crédito con seguro.</li>
            </ul>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="risk-accept"
              checked={checked}
              onCheckedChange={(val) =>
                setChecked(val === true)
              }
              className="mt-0.5 border-brand-accent bg-transparent data-[state=checked]:bg-brand-accent data-[state=checked]:border-brand-accent data-[state=checked]:text-white"
            />
            <Label
              htmlFor="risk-accept"
              className="text-xs text-muted-foreground"
            >
              Entiendo y acepto los riesgos de contratar un crédito sin seguro. Asumo la responsabilidad total del pago en las situaciones descritas.
            </Label>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex flex-col gap-3">
          <button
            type="button"
            disabled={!checked}
            onClick={onAccept}
            className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-brand-accent"
          >
            Continuar
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-xl py-3.5 text-sm font-medium text-foreground border border-border transition hover:bg-secondary active:scale-[0.98]"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CreditSelection() {
  const router = useRouter()

  const salary = 3500
  const maxAmount = salary * 3
  const minAmount = 1000
  const [amount, setAmount] = useState(Math.round(maxAmount / 2))
  const [term, setTerm] = useState(12)
  const [hasInsurance, setHasInsurance] = useState(true)
  const [showRiskModal, setShowRiskModal] = useState(false)

  useEffect(() => {
    if (showRiskModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [showRiskModal])

  const biweeklyPayment = (() => {
    const total = amount * (1 + MONTHLY_RATE * term)
    const insuranceTotal = hasInsurance ? amount * INSURANCE_RATE : 0
    return (total + insuranceTotal) / (term * 2)
  })()

  const pct = ((amount - minAmount) / (maxAmount - minAmount)) * 100

  const handleInsuranceClick = (value: boolean) => {
    if (!value) {
      setShowRiskModal(true)
    } else {
      setShowRiskModal(false)
      setHasInsurance(true)
    }
  }

  const handleRiskAccept = () => {
    setHasInsurance(false)
    setShowRiskModal(false)
  }

  const handleRiskCancel = () => {
    setShowRiskModal(false)
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

        {/* Amount slider */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Monto del crédito</label>
              <span className="text-base font-bold text-foreground">${amount.toLocaleString('es-MX')}</span>
            </div>
            <div className="relative py-2">
              <input
                type="range"
                min={minAmount}
                max={maxAmount}
                step={500}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full appearance-none h-2 rounded-full outline-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--brand-accent) 0%, var(--brand-accent) ${pct}%, var(--brand-inactive) ${pct}%, var(--brand-inactive) 100%)`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>${minAmount.toLocaleString('es-MX')}</span>
              <span>${maxAmount.toLocaleString('es-MX')}</span>
            </div>
          </div>

          {/* Term selection */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Plazo</label>
            <div className="grid grid-cols-3 gap-2">
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
                  {t}m
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
              className={`rounded-xl py-3 px-4 text-sm font-medium transition active:scale-[0.97] text-left flex flex-col gap-0.5 ${hasInsurance
                ? 'bg-brand-dark text-white'
                : 'border border-border text-foreground hover:bg-secondary'
                }`}
            >
              <span className="font-semibold">Protegido</span>
              <span className={`text-xs ${hasInsurance ? 'text-white/70' : 'text-muted-foreground'}`}>Con seguro</span>
            </button>
            <button
              type="button"
              onClick={() => handleInsuranceClick(false)}
              className={`rounded-xl py-3 px-4 text-sm font-medium transition active:scale-[0.97] text-left flex flex-col gap-0.5 ${!hasInsurance
                ? 'bg-brand-dark text-white'
                : 'border border-border text-foreground hover:bg-secondary'
                }`}
            >
              <span className="font-semibold">Esencial</span>
              <span className={`text-xs ${!hasInsurance ? 'text-white/70' : 'text-muted-foreground'}`}>Sin seguro</span>
            </button>
          </div>
        </div>

        {/* Summary card */}
        <div className="rounded-2xl border border-border bg-secondary/40 p-4 flex flex-col gap-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Resumen estimado</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Monto solicitado</p>
              <p className="text-sm font-semibold text-foreground">${amount.toLocaleString('es-MX')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pago quincenal</p>
              <p className="text-sm font-semibold text-foreground">${biweeklyPayment.toLocaleString('es-MX', { maximumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Plazo</p>
              <p className="text-sm font-semibold text-foreground">{term} meses</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tipo</p>
              <p className="text-sm font-semibold text-foreground">{hasInsurance ? 'Protegido' : 'Esencial'}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <ButtonCard
            onClick={() => router.push(ROUTES.ONBOARDING.CREDIT_SUMMARY)}
          >
            Continuar
          </ButtonCard>
          <ButtonCard
            variant="secondary"
            onClick={() => router.push(ROUTES.ONBOARDING.CREDIT_RESULT)}
          >
            Regresar
          </ButtonCard>
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
