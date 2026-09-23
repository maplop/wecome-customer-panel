'use client'
import { useState } from 'react'
import { WrapperCard } from '@/components/common/WrapperCard'
import { TitleCard } from '@/components/common/TitleCard'
import { SubtitleCard } from '@/components/common/SubtitleCard'
import { ButtonCard } from '@/components/common/ButtonCard'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'
import { Search, Check } from '@/lib/icons'
import { updateClientData } from '@/services/client-data'
import { InfoNote } from '../common/InfoNote'

export default function CreditAuthorization() {
  const router = useRouter()
  const [accepted, setAccepted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')


  const handleContinue = async () => {
    const nextStep = ROUTES.ONBOARDING.CREDIT_SELECTION
    setIsSubmitting(true)
    setError('')
    try {
      await updateClientData({ pii: { paso_actual: nextStep } })
      router.push(nextStep)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo continuar. Intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <WrapperCard>
      <div className="flex flex-col gap-2">
        <TitleCard>Consulta de historial crediticio</TitleCard>
        <SubtitleCard>
          Para continuar con tu solicitud, es necesario consultar tu historial crediticio.
        </SubtitleCard>
      </div>

      <div className="rounded-2xl border border-border bg-secondary/40 p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex justify-center items-center w-10 h-10 rounded-full bg-brand-accent/20 shrink-0">
            <Search className="w-5 h-5 text-brand-accent" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            ¿Qué es esta consulta?
          </p>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Wecome realizará una consulta a las Sociedades de Información Crediticia
          (Buró de Crédito y Círculo de Crédito) para conocer tu historial como
          deudor y evaluar tu solicitud de crédito.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-secondary/40 p-5 flex flex-col gap-4">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
          ¿Qué datos se consultarán?
        </p>
        <ul className="flex flex-col gap-2">
          {[
            'Comportamiento de pago de créditos vigentes y anteriores',
            'Monto y antigüedad de tus créditos',
            'Consultas realizadas a tu historial por otras instituciones',
            'Incumplimientos o morosidad en tus obligaciones',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-brand-accent mt-0.5 shrink-0" />
              <span className="text-xs text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/*
      <InfoNote
        text="Esta consulta quedará registrada en tu historial crediticio. Si realizas
          solicitudes de crédito en múltiples instituciones en un periodo corto,
          esto puede afectar tu calificación crediticia."
      />
      */}

      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => setAccepted(!accepted)}
          className="relative mt-0.5 shrink-0"
        >
          <div
            className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition ${accepted ? 'border-transparent bg-brand-accent' : 'border-border'}`}
          >
            {accepted && <Check className="stroke-white w-4 h-4" />}
          </div>
        </button>
        <label
          onClick={() => setAccepted(!accepted)}
          className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none"
        >
          Autorizo a Wecome a consultar mi historial crediticio ante las Sociedades
          de Información Crediticia para los fines de evaluación de mi solicitud de
          crédito.
        </label>
      </div>

      <div className="flex flex-col gap-3">
        <ButtonCard
          onClick={handleContinue}
          disabled={!accepted || isSubmitting}
          loading={isSubmitting}
        >
          Continuar
        </ButtonCard>
        <ButtonCard
          variant="secondary"
          disabled={isSubmitting}
          onClick={() => router.push(ROUTES.ONBOARDING.TERMS_ACCEPTANCE)}
        >
          Regresar
        </ButtonCard>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </WrapperCard>
  )
}
