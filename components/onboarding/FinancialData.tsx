'use client'

import { useState } from 'react'
import { WrapperCard, TitleCard, SubtitleCard, ButtonCard, InfoNote } from '../common'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'
import { useClientProfileStore } from '@/stores/client-profile-store'
import { updateClientData } from '@/services/client-data'

export default function FinancialData() {
  const router = useRouter()

  const { data } = useClientProfileStore()

  const salary = data?.salario
  const [error, setError] = useState('')

  const formatMXN = (value: string) => {
    const numeric = value.replace(/\D/g, '')
    return numeric ? Number(numeric).toLocaleString('es-MX') : ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const num = Number(salary)

    if (!salary) {
      setError('Ingresa tu salario mensual')
      return
    }

    if (num < 3000) {
      setError('El salario minimo requerido es $3,000')
      return
    }

    if (num > 500000) {
      setError('Verifica el monto ingresado')
      return
    }

    try {
      await updateClientData({
        pii: {
          current_step: ROUTES.ONBOARDING.CREDIT_RESULT,
        },
      })

      router.push(ROUTES.ONBOARDING.CREDIT_RESULT)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar el paso actual. Intenta nuevamente.',
      )
    }
  }

  return (
    <WrapperCard>
      <div className="flex flex-col gap-2">
        <TitleCard>
          Datos financieros
        </TitleCard>
        <SubtitleCard>
          Con base en la informacion registrada, calculamos el monto de credito disponible para ti.
        </SubtitleCard>
      </div>

      <InfoNote
        text="La informacion mostrada es confidencial y se utiliza unicamente para calcular tu linea de credito."
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
              value={formatMXN(salary?.toString() ?? '')}
              disabled
              className={`w-full rounded-xl border px-4 py-3 pl-7 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 ${error ? 'border-destructive' : 'border-border bg-background'}`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">MXN</span>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          {salary && !error && (
            <p className="text-xs text-muted-foreground">
              Hasta <span className="font-semibold text-foreground">${(Number(salary) * 3 * 0.6).toLocaleString('es-MX')} MXN</span> disponible en credito
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <ButtonCard submit>
            Calcular credito
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
