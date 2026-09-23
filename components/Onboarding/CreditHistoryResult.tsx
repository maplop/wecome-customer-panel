'use client'

import { useState } from 'react'
import { ButtonCard } from '@/components/common/ButtonCard'
import { InfoNote } from '@/components/common/InfoNote'
import { SubtitleCard } from '@/components/common/SubtitleCard'
import { TitleCard } from '@/components/common/TitleCard'
import { WrapperCard } from '@/components/common/WrapperCard'
import { Check } from '@/lib/icons'
import { ROUTES } from '@/lib/routes'
import { updateClientData } from '@/services/client-data'
import { useClientDataStore } from '@/stores/client-data-store'
import { useCreditHistoryQueryStore } from '@/stores/credit-history-query-store'
import { useRouter } from 'next/navigation'

export default function CreditHistoryResult() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const piiCategory = useClientDataStore((state) => state.client?.pii?.historial_crediticio)
  const queryCategory = useCreditHistoryQueryStore((state) => state.category)
  const querySource = useCreditHistoryQueryStore((state) => state.source)
  const category = queryCategory ?? piiCategory ?? null
  const usedFallback = querySource === 'fallback'

  const handleContinue = async () => {
    const nextStep = ROUTES.ONBOARDING.CREDIT_SELECTION

    try {
      setError('')
      setIsSubmitting(true)
      await updateClientData({ pii: { paso_actual: nextStep } })
      router.push(nextStep)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo continuar. Intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!category) {
    return (
      <WrapperCard>
        <div className="flex flex-col gap-2">
          <TitleCard>Resultado de tu consulta</TitleCard>
          <SubtitleCard>
            No encontramos el resultado de tu historial crediticio. Regresa e intenta realizar la consulta nuevamente.
          </SubtitleCard>
        </div>
        <ButtonCard variant="secondary" onClick={() => router.push(ROUTES.ONBOARDING.CREDIT_AUTHORIZATION)}>
          Regresar
        </ButtonCard>
      </WrapperCard>
    )
  }

  return (
    <WrapperCard className="text-center">

      <div className="flex flex-col items-center gap-4">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-dark"
        >
          <Check className="stroke-brand-accent w-10 h-10" />
        </div>
        <div className="flex flex-col gap-2">
          <TitleCard>{usedFallback ? 'Continuamos con tu evaluación' : 'Consulta realizada correctamente'}</TitleCard>
          <SubtitleCard>
            {usedFallback
              ? 'No fue posible obtener tu historial crediticio, por lo que usaremos la categoría mínima para evaluar tu solicitud.'
              : 'Usaremos el resultado de tu consulta para evaluar las opciones de crédito disponibles para ti.'}
          </SubtitleCard>
        </div>
      </div>

      <section className="flex flex-col items-center gap-3 rounded-2xl bg-brand-dark p-6 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-white/60">
          Categoría usada en tu evaluación
        </p>
        <p className="text-4xl font-bold text-white uppercase">{category}</p>
      </section>

      <InfoNote
        text="Esta categoría nos ayuda a evaluar las opciones de crédito disponibles para ti. No representa una aprobación ni garantiza las condiciones finales de tu solicitud."
        className="text-left"
      />

      <div className="flex flex-col gap-3">
        <ButtonCard onClick={handleContinue} disabled={isSubmitting} loading={isSubmitting}>
          Ver mis opciones de crédito
        </ButtonCard>
        <ButtonCard
          variant="secondary"
          disabled={isSubmitting}
          onClick={() => router.push(ROUTES.ONBOARDING.CREDIT_AUTHORIZATION)}
        >
          Regresar
        </ButtonCard>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    </WrapperCard>
  )
}
