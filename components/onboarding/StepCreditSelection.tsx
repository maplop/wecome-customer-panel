'use client'

import { useState } from 'react'

interface StepCreditSelectionProps {
  salary: number
  onNext: (data: { amount: number; term: number; hasInsurance: boolean }) => void
  onBack: () => void
}

const TERMS = [6, 12, 18, 24]
const MONTHLY_RATE = 0.028
const INSURANCE_RATE = 0.02

export default function StepCreditSelection({ salary, onNext, onBack }: StepCreditSelectionProps) {
  const maxAmount = salary * 3
  const minAmount = 1000
  const [amount, setAmount] = useState(Math.round(maxAmount / 2))
  const [term, setTerm] = useState(12)
  const [hasInsurance, setHasInsurance] = useState(false)

  const biweeklyPayment = (() => {
    const total = amount * (1 + MONTHLY_RATE * term)
    const insuranceTotal = hasInsurance ? amount * INSURANCE_RATE : 0
    return (total + insuranceTotal) / (term * 2)
  })()

  const pct = ((amount - minAmount) / (maxAmount - minAmount)) * 100

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground text-balance">
          Elige tu crédito
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Ajusta el monto y el plazo de acuerdo a tus necesidades.
        </p>
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
                background: `linear-gradient(to right, #E1941F 0%, #E1941F ${pct}%, #e5e7eb ${pct}%, #e5e7eb 100%)`,
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
          <div className="grid grid-cols-4 gap-2">
            {TERMS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTerm(t)}
                className={`rounded-xl py-2.5 text-sm font-medium transition active:scale-[0.97] ${term === t
                  ? 'text-white'
                  : 'border border-border text-foreground hover:bg-secondary'
                  }`}
                style={term === t ? { backgroundColor: '#2B2929' } : {}}
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
            onClick={() => setHasInsurance(false)}
            className={`rounded-xl py-3 px-4 text-sm font-medium transition active:scale-[0.97] text-left flex flex-col gap-0.5 ${
              !hasInsurance
                ? 'text-white'
                : 'border border-border text-foreground hover:bg-secondary'
            }`}
            style={!hasInsurance ? { backgroundColor: '#2B2929' } : {}}
          >
            <span className="font-semibold">Esencial</span>
            <span className={`text-xs ${!hasInsurance ? 'text-white/70' : 'text-muted-foreground'}`}>Sin seguro</span>
          </button>
          <button
            type="button"
            onClick={() => setHasInsurance(true)}
            className={`rounded-xl py-3 px-4 text-sm font-medium transition active:scale-[0.97] text-left flex flex-col gap-0.5 ${
              hasInsurance
                ? 'text-white'
                : 'border border-border text-foreground hover:bg-secondary'
            }`}
            style={hasInsurance ? { backgroundColor: '#2B2929' } : {}}
          >
            <span className="font-semibold">Protegido</span>
            <span className={`text-xs ${hasInsurance ? 'text-white/70' : 'text-muted-foreground'}`}>Con seguro</span>
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
        <button
          type="button"
          onClick={() => onNext({ amount, term, hasInsurance })}
          className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition active:scale-[0.98] hover:opacity-90"
          style={{ backgroundColor: '#E1941F' }}
        >
          Continuar
        </button>
        <button
          type="button"
          onClick={onBack}
          className="w-full rounded-xl border border-border py-3.5 text-sm font-medium text-foreground transition hover:bg-secondary active:scale-[0.98]"
        >
          Regresar
        </button>
      </div>
    </div>
  )
}
