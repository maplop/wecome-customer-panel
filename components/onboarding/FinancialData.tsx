'use client'

import { useState } from 'react'
import { WrapperCard, TitleCard, SubtitleCard, ButtonCard, InfoNote } from '../common'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'
import { useClientDataStore } from '@/stores'
import { updateActiveRequestData } from '@/services/client-requests'
import { formatMoney } from '@/utils/formatters'

export default function FinancialData() {
  const router = useRouter()

  const { client } = useClientDataStore()
  const salary = client?.pii?.salario ?? 0

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isSubmitting) return

    const num = Number(salary)

    if (!salary) {
      setError('Ingresa tu salario mensual')
      return
    }

    if (num < 3000) {
      setError('El salario mínimo requerido es 3,000 MXN')
      return
    }

    if (num > 500000) {
      setError('Verifica el monto ingresado')
      return
    }
    setError('')
    setIsSubmitting(true)

    try {
      const nextStep = ROUTES.ONBOARDING.CREDIT_RESULT
      const montoMaximoSolicitable = String(num * 3 * 0.6)

      await updateActiveRequestData(
        {
          monto_maximo_solicitable: montoMaximoSolicitable,
          paso_actual: nextStep,
        },
      )

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
    <WrapperCard>
      <div className="flex flex-col gap-2">
        <TitleCard>
          Datos financieros
        </TitleCard>
        <SubtitleCard>
          Con base en la información registrada, calculamos el monto de crédito disponible para ti.
        </SubtitleCard>
      </div>

      <InfoNote
        text="La información mostrada es confidencial y se utiliza únicamente para calcular tu linea de crédito."
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="salary" className="text-sm font-medium text-foreground">
            Salario mensual neto
          </label>
          <div className="relative">
            <input
              id="salary"
              type="text"
              inputMode="numeric"
              placeholder="0"
              readOnly
              value={formatMoney(Number(salary))}
              disabled
              className={`w-full rounded-xl border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 ${error ? 'border-destructive' : 'border-border bg-background'}`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">MXN</span>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          {salary && !error && (
            <p className="text-xs text-muted-foreground">
              Hasta <span className="font-semibold text-foreground">{formatMoney(salary * 3 * 0.6)} MXN</span> disponible en crédito
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <ButtonCard
            submit
            loading={isSubmitting}
            loadingText='Calculando...'
            disabled={isSubmitting || !!error}
          >
            Calcular crédito
          </ButtonCard>

          <ButtonCard
            variant="secondary"
            disabled={isSubmitting}
            onClick={() => router.push(ROUTES.ONBOARDING.UPLOAD_DOCUMENTS)}
          >
            Regresar
          </ButtonCard>
        </div>
      </form>
    </WrapperCard>
  )
}
