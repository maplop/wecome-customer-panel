'use client'
import { useState } from 'react'
import { ButtonCard } from '@/components/common/ButtonCard'
import { SubtitleCard } from '@/components/common/SubtitleCard'
import { TitleCard } from '@/components/common/TitleCard'
import { WrapperCard } from '@/components/common/WrapperCard'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'
import { Check } from '@/lib/icons'
import { updateClientData } from '@/services/client-data'
import { useClientRequestStore } from '@/stores'


export default function CreditSuccess() {

  const activeRequest = useClientRequestStore((state) => state.getActiveRequest())

  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleContinue = async () => {
    const nextStep = ROUTES.DASHBOARD.ROOT
    setIsSubmitting(true)
    try {
      setError('')

      await updateClientData({ pii: { paso_actual: nextStep } })

      router.push(nextStep)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar el paso actual. Intenta nuevamente.',
      )
    }
    finally {
      setIsSubmitting(false)
    }
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
          <TitleCard>
            ¡Solicitud enviada!
          </TitleCard>
          <SubtitleCard>
            Tu solicitud de crédito por{' '}
            <strong className="text-foreground">{Number(activeRequest?.data.monto_solicitado).toLocaleString('es-MX')} MXN</strong>{' '}
            ha sido enviada a nuestro equipo y se encuentra en proceso de revisión
          </SubtitleCard>
        </div>
      </div>

      <div className="w-full rounded-2xl border border-border bg-secondary/40 p-5 flex flex-col gap-4 text-left">
        <p className="text-sm font-semibold text-foreground">¿Qué sigue?</p>
        <div className="flex flex-col gap-3">
          {[
            { step: '01', text: 'Recibirás un correo de confirmación en los próximos minutos.' },
            { step: '02', text: 'Un asesor revisará tu solicitud en un plazo de 24 horas.' },
            { step: '03', text: 'El depósito se realizará en máximo 2 días hábiles.' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-3">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white bg-brand-accent"
              >
                {step}
              </span>
              <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <ButtonCard
        onClick={handleContinue}
        loading={isSubmitting}
        disabled={isSubmitting}
      >
        Ver solicitud
      </ButtonCard>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </WrapperCard>
  )
}
