'use client'

import { useState } from 'react'

interface StepFinancialDataProps {
  onNext: (data: { salary: number }) => void
  onBack: () => void
}

export default function StepFinancialData({ onNext, onBack }: StepFinancialDataProps) {
  const [salary, setSalary] = useState('')
  const [error, setError] = useState('')

  const formatMXN = (value: string) => {
    const numeric = value.replace(/\D/g, '')
    return numeric ? Number(numeric).toLocaleString('es-MX') : ''
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    setSalary(raw)
    if (error) setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const num = Number(salary)
    if (!salary) { setError('Ingresa tu sueldo mensual'); return }
    if (num < 3000) { setError('El sueldo mínimo requerido es $3,000'); return }
    if (num > 500000) { setError('Verifica el monto ingresado'); return }
    onNext({ salary: num })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground text-balance">
          Datos financieros
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Necesitamos conocer tu sueldo mensual neto para calcular el monto de crédito disponible.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-secondary/40 p-4 flex gap-3 items-start">
        <span className="mt-0.5 shrink-0" style={{ color: '#E1941F' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </span>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Tu información está protegida con encriptación de 256-bit. Solo se usa para calcular tu crédito.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="salary" className="text-sm font-medium text-foreground">
            Sueldo mensual neto
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">$</span>
            <input
              id="salary"
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={formatMXN(salary)}
              onChange={handleChange}
              className={`w-full rounded-xl border px-4 py-3 pl-7 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 ${error ? 'border-destructive' : 'border-border bg-background'}`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">MXN</span>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          {salary && !error && (
            <p className="text-xs text-muted-foreground">
              Hasta <span className="font-semibold text-foreground">${(Number(salary) * 3).toLocaleString('es-MX')}</span> disponible en crédito
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition active:scale-[0.98] hover:opacity-90"
          style={{ backgroundColor: '#E1941F' }}
        >
          Calcular crédito
        </button>
      </form>

      <button
        type="button"
        onClick={onBack}
        className="w-full rounded-xl border border-border py-3.5 text-sm font-medium text-foreground transition hover:bg-secondary active:scale-[0.98]"
      >
        Regresar
      </button>
    </div>
  )
}
