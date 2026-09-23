'use client'
import { useEffect, useState } from 'react'
import { WrapperCard } from '@/components/common/WrapperCard'
import { TitleCard } from '@/components/common/TitleCard'
import { SubtitleCard } from '@/components/common/SubtitleCard'
import { ButtonCard } from '@/components/common/ButtonCard'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'
import { Search, Check } from '@/lib/icons'
import { updateClientData } from '@/services/client-data'
import {
  getJumioPiiData,
  useJumioVerificationStore,
} from '@/stores/jumio-verification-store'
import { useClientDataStore } from '@/stores/client-data-store'
import { useCreditHistoryQueryStore } from '@/stores/credit-history-query-store'
import {
  fetchRccFicoScore,
  LOWEST_CREDIT_HISTORY_CATEGORY,
} from '@/services/onboarding/rcc-fico-score'

export default function CreditAuthorization() {
  const router = useRouter()
  const [accepted, setAccepted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showJumioPendingModal, setShowJumioPendingModal] = useState(false)
  const [showScoreErrorModal, setShowScoreErrorModal] = useState(false)
  const [showDefaultScoreAlert, setShowDefaultScoreAlert] = useState(false)
  const clientId = useClientDataStore((state) => state.client?.id)
  const existingHistorialCrediticio = useClientDataStore(
    (state) => state.client?.pii?.historial_crediticio,
  )
  const setCreditHistoryQuery = useCreditHistoryQueryStore((state) => state.setResult)
  const jumioStatus = useJumioVerificationStore((state) => state.status)
  const jumioResult = useJumioVerificationStore((state) => state.result)
  const jumioModalTitle = jumioStatus === 'failed'
    ? 'No fue posible validar tu INE'
    : 'Validación de INE en proceso'
  const jumioModalMessage = jumioStatus === 'failed'
    ? 'No fue posible validar tu INE. Regresa a la carga de documentos e intenta nuevamente con fotos legibles.'
    : 'Aún estamos validando tu INE. Necesitamos confirmar los datos de tu identificación antes de consultar tu historial crediticio. Te avisaremos cuando puedas continuar.'
  const hasOpenModal = showJumioPendingModal || showScoreErrorModal || showDefaultScoreAlert

  useEffect(() => {
    document.body.style.overflow = hasOpenModal ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [hasOpenModal])

  const handleContinue = async () => {
    if (jumioStatus !== 'completed' || !jumioResult?.valid) {
      setShowJumioPendingModal(true)
      return
    }

    const jumioPiiData = getJumioPiiData(jumioResult)

    if (!jumioPiiData) {
      setError('No se encontraron los datos de identificación de Jumio. Intenta validar tu INE nuevamente.')
      return
    }

    setIsSubmitting(true)
    setError('')
    try {
      const hasExistingHistorial = typeof existingHistorialCrediticio === 'string'
        && existingHistorialCrediticio.trim().length > 0
      const historialCrediticio = hasExistingHistorial
        ? existingHistorialCrediticio.trim()
        : await fetchRccFicoScore(clientId ?? '')
      if (!historialCrediticio) {
        setShowScoreErrorModal(true)
        return
      }

      const nextStep = ROUTES.ONBOARDING.CREDIT_HISTORY_RESULT
      await updateClientData({
        pii: {
          historial_crediticio: historialCrediticio,
          paso_actual: nextStep,
        },
      })
      setCreditHistoryQuery(historialCrediticio, hasExistingHistorial ? 'profile' : 'rcc')
      router.push(nextStep)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo continuar. Intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContinueWithoutHistory = async () => {
    const nextStep = ROUTES.ONBOARDING.CREDIT_HISTORY_RESULT

    try {
      setIsSubmitting(true)
      setError('')
      await updateClientData({
        pii: {
          historial_crediticio: LOWEST_CREDIT_HISTORY_CATEGORY,
          paso_actual: nextStep,
        },
      })
      setCreditHistoryQuery(LOWEST_CREDIT_HISTORY_CATEGORY, 'fallback')
      router.push(nextStep)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo continuar. Intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
      setShowDefaultScoreAlert(false)
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
          className="flex flex-col gap-1 text-xs text-muted-foreground leading-relaxed cursor-pointer select-none"
        >
          <span>
            Autorizo la consulta de mi historial crediticio.
          </span>
        </label>
      </div>

      <div className="flex flex-col gap-3">
        <ButtonCard
          onClick={handleContinue}
          disabled={!accepted || isSubmitting}
          loading={isSubmitting}
          loadingText="Consultando historial crediticio..."
        >
          Autorizar y consultar historial
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

      {showJumioPendingModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="jumio-pending-title"
            className="w-full max-w-md rounded-2xl bg-background p-6 shadow-2xl"
          >
            <h2 id="jumio-pending-title" className="text-lg font-bold text-foreground">
              {jumioModalTitle}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {jumioModalMessage}
            </p>
            <ButtonCard
              className="mt-6"
              onClick={() => setShowJumioPendingModal(false)}
            >
              Entendido
            </ButtonCard>
          </div>
        </div>
      ) : null}

      {showScoreErrorModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="score-error-title"
            className="w-full max-w-md rounded-2xl bg-background p-6 shadow-2xl"
          >
            <h2 id="score-error-title" className="text-lg font-bold text-foreground">
              No pudimos consultar tu historial crediticio
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              No fue posible obtener tu score crediticio en este momento. Puedes intentarlo nuevamente o continuar sin historial crediticio.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <ButtonCard
                onClick={() => {
                  setShowScoreErrorModal(false)
                  void handleContinue()
                }}
              >
                Intentar nuevamente
              </ButtonCard>
              <ButtonCard
                variant="secondary"
                onClick={() => {
                  setShowScoreErrorModal(false)
                  setShowDefaultScoreAlert(true)
                }}
              >
                Continuar con categoría Malo
              </ButtonCard>
            </div>
          </div>
        </div>
      ) : null}

      {showDefaultScoreAlert ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="default-score-title"
            className="w-full max-w-md rounded-2xl bg-background p-6 shadow-2xl"
          >
            <h2 id="default-score-title" className="text-lg font-bold text-foreground">
              Continuar con la categoría más baja
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Al continuar sin historial crediticio, valoraremos tu solicitud con la categoría de menor rango: {LOWEST_CREDIT_HISTORY_CATEGORY}.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <ButtonCard onClick={() => void handleContinueWithoutHistory()} loading={isSubmitting}>
                Continuar
              </ButtonCard>
              <ButtonCard
                variant="secondary"
                disabled={isSubmitting}
                onClick={() => setShowDefaultScoreAlert(false)}
              >
                Cancelar
              </ButtonCard>
            </div>
          </div>
        </div>
      ) : null}
    </WrapperCard>
  )
}
