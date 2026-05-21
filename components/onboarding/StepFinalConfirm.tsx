'use client'

import { useState } from 'react'

interface StepFinalConfirmProps {
  amount: number
  term: number
  hasInsurance: boolean
  onConfirm: () => void
  onBack: () => void
}

const MONTHLY_RATE = 0.028
const COMMISSION_RATE = 0.02

export default function StepFinalConfirm({ amount, term, hasInsurance, onConfirm, onBack }: StepFinalConfirmProps) {
  const [loading, setLoading] = useState(false)

  const totalInterest = Math.round(amount * MONTHLY_RATE * term)
  const insuranceCost = hasInsurance ? Math.round(amount * 0.02) : 0
  const totalPayment = amount + totalInterest + insuranceCost
  const biweeklyPayment = totalPayment / (term * 2)

  const startDate = new Date()
  startDate.setDate(startDate.getDate() + 7)
  const formattedStart = startDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })

  const handleConfirm = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    onConfirm()
  }

  const details = [
    { label: 'Monto aprobado', value: `$${amount.toLocaleString('es-MX')} MXN` },
    { label: 'Pago quincenal', value: `$${biweeklyPayment.toLocaleString('es-MX', { maximumFractionDigits: 2 })}` },
    { label: 'Plazo', value: `${term} meses (${term * 2} quincenas)` },
    ...(hasInsurance ? [{ label: 'Seguro', value: 'Incluido' }] : []),
    { label: 'Fecha de inicio', value: formattedStart },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground text-balance">
          Confirmación final
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Revisa los datos finales y confirma tu solicitud de crédito.
        </p>
      </div>

      {/* Final card */}
      <div className="rounded-2xl overflow-hidden border border-border">
        <div className="px-5 py-4 flex flex-col items-center gap-2 text-center" style={{ backgroundColor: '#2B2929' }}>
          <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: '#E1941F' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
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
        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading}
          className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition active:scale-[0.98] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ backgroundColor: '#E1941F' }}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
              Procesando...
            </>
          ) : 'Confirmar solicitud'}
        </button>
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="w-full rounded-xl border border-border py-3.5 text-sm font-medium text-foreground transition hover:bg-secondary active:scale-[0.98] disabled:opacity-50"
        >
          Regresar
        </button>
      </div>
    </div>
  )
}
