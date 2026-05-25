'use client'

import { useState } from 'react'
import { WrapperCard, TitleCard, SubtitleCard, ButtonCard } from '../common'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'

export default function FinancialData() {
  const router = useRouter()

  const salary = 3500
  const [error, setError] = useState('')
  const formatMXN = (value: string) => {
    const numeric = value.replace(/\D/g, '')
    return numeric ? Number(numeric).toLocaleString('es-MX') : ''
  }


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const num = Number(salary)
    if (!salary) { setError('Ingresa tu salario mensual'); return }
    if (num < 3000) { setError('El salario mínimo requerido es $3,000'); return }
    if (num > 500000) { setError('Verifica el monto ingresado'); return }

    router.push(ROUTES.ONBOARDING.CREDIT_RESULT)
  }

  return (
    <WrapperCard>
      <div className="flex flex-col gap-2">
        <TitleCard>
          Datos financieros
        </TitleCard>
        <SubtitleCard>
          Con base en la información registrada, calculamos el monto de crédito disponible para ti.
        </SubtitleCard>
      </div>

      <div className="rounded-2xl border border-border bg-secondary/40 p-4 flex gap-3 items-start">
        <span className="mt-0.5 shrink-0 text-brand-accent">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        </span>
        <p className="text-xs text-muted-foreground leading-relaxed">
          La información mostrada es confidencial y se utiliza únicamente para calcular tu línea de crédito.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="salary" className="text-sm font-medium text-foreground">
            Salario mensual neto
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">$</span>
            <input
              id="salary"
              type="text"
              inputMode="numeric"
              placeholder="0"
              readOnly
              value={formatMXN(salary.toString())}
              className={`w-full rounded-xl border px-4 py-3 pl-7 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 ${error ? 'border-destructive' : 'border-border bg-background'}`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">MXN</span>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          {salary && !error && (
            <p className="text-xs text-muted-foreground">
              Hasta <span className="font-semibold text-foreground">${(Number(salary) * 3 * 0.6).toLocaleString('es-MX')}</span> disponible en crédito
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <ButtonCard
            submit
          >
            Calcular crédito
          </ButtonCard>

          <ButtonCard
            variant="secondary"
            onClick={() => router.push(ROUTES.ONBOARDING.UPLOAD_DOCUMENTS)}
          >
            Regresar
          </ButtonCard>
        </div>
      </form>
    </WrapperCard>
  )
}
