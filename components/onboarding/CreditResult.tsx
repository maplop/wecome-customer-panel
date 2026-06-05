'use client'
import { useState } from 'react'
import { WrapperCard, TitleCard, SubtitleCard, ButtonCard } from '../common'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'
import { Check } from '@/lib/icons'
import { updateClientData } from '@/services/client-data'

export default function CreditResult() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const salary = 3500
  const maxCredit = salary * 3

  const handleContinue = async () => {
    setIsSubmitting(true)
    try {
      await updateClientData({
        pii: {
          current_step: ROUTES.ONBOARDING.CREDIT_SELECTION,
        },
      })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar el paso actual. Intenta nuevamente.',
      )
    } finally {
      setIsSubmitting(false)
    }

    router.push(ROUTES.ONBOARDING.CREDIT_SELECTION)
  }

  return (
    <WrapperCard>
      <div className="flex flex-col gap-2">
        <TitleCard>
          Resultado de tu crédito
        </TitleCard>
        <SubtitleCard>
          Basándonos en tu salario, este es el monto máximo preaprobado para ti.
        </SubtitleCard>
      </div>

      {/* Hero amount */}
      <div
        className="rounded-2xl p-6 flex flex-col items-center gap-3 text-center bg-brand-dark"
      >
        <span className="text-xs font-medium text-white/60 uppercase tracking-widest">Monto máximo aprobado</span>
        <div className="flex flex-col gap-1">
          <span className="text-4xl font-bold text-white">
            ${maxCredit.toLocaleString('es-MX')}
          </span>
          <span className="text-sm text-white/60">MXN</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <Check className="stroke-brand-success-light w-5 h-5" />
          <span className="text-xs text-white/70">Preaprobado al instante</span>
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
          onClick={() => router.push(ROUTES.ONBOARDING.FINANCIAL_DATA)}
        >
          Regresar
        </ButtonCard>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </WrapperCard>
  )
}
