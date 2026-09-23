'use client'

import { useState, useEffect, useRef } from 'react'
import { ButtonCard } from '@/components/common/ButtonCard'
import { SubtitleCard } from '@/components/common/SubtitleCard'
import { TitleCard } from '@/components/common/TitleCard'
import { WrapperCard } from '@/components/common/WrapperCard'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'
import { X, Check, FileText } from '@/lib/icons'
import { updateClientData } from '@/services/client-data'
import { useJumioVerificationStore } from '@/stores/jumio-verification-store'
import { awaitJumioApproval, fetchJumioStatusOnce } from '@/services/onboarding/jumio-status'
import { syncJumioDataToPii } from '@/services/onboarding/jumio-pii-mapping'

const DOCUMENTS = [
  {
    id: 'advertising',
    title: 'Formato para fines publicitarios y mercadológicos',
    url: '/documents/advertising.pdf',
  },
  {
    id: 'transparency',
    title: 'Aviso de transparencia y acceso a la información pública',
    url: '/documents/transparency.pdf',
  },
  {
    id: 'privacy',
    title: 'Aviso de Privacidad Integral',
    url: '/documents/privacy.pdf',
  },
  {
    id: 'insurance',
    title: 'Autorización para contratación de seguro',
    url: '/documents/insurance.pdf',
  },
  {
    id: 'terms',
    title: 'Términos y Condiciones',
    url: '/documents/terms.pdf',
  },
]

export default function TermsAcceptance() {
  const router = useRouter()

  // Gate Jumio: solo se puede avanzar a CREDIT_SELECTION con veredicto
  // positivo. El dashboard navega a CREDIT_SELECTION por otra ruta (nueva
  // solicitud), así que este gate no lo afecta.
  const jumioStatus = useJumioVerificationStore((s) => s.status)
  const jumioAccountId = useJumioVerificationStore((s) => s.accountId)
  const jumioWorkflowId = useJumioVerificationStore((s) => s.workflowId)
  const jumioClientId = useJumioVerificationStore((s) => s.clientId)
  const jumioErrorMessage = useJumioVerificationStore((s) => s.errorMessage)
  const piiSynced = useJumioVerificationStore((s) => s.piiSynced)

  const [accepted, setAccepted] = useState<Record<string, boolean>>({
    advertising: false,
    transparency: false,
    privacy: false,
    insurance: false,
    terms: false,
  })
  const [modalDoc, setModalDoc] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingJumio, setIsCheckingJumio] = useState(false)
  const [checkProgress, setCheckProgress] = useState('')
  const [isSyncingJumio, setIsSyncingJumio] = useState(false)
  const [syncError, setSyncError] = useState('')
  const checkingRef = useRef(false)
  const syncingRef = useRef(false)
  const abortRef = useRef<AbortController | null>(null)

  const allAccepted = Object.values(accepted).every(Boolean)
  const isJumioApproved = jumioStatus === 'approved'

  // Envía los datos extraídos por Jumio al PII con el mapeo local tipado.
  const runJumioSyncWithData = async (statusData: unknown) => {
    if (useJumioVerificationStore.getState().piiSynced) return
    if (syncingRef.current) return
    syncingRef.current = true
    setIsSyncingJumio(true)
    setSyncError('')
    try {
      const keys = await syncJumioDataToPii({ statusData })
      console.log('[terms-acceptance] datos de Jumio sincronizados al pii:', keys)
    } catch (err) {
      setSyncError(
        err instanceof Error
          ? err.message
          : 'No se pudieron sincronizar los datos de tu INE al perfil.',
      )
    } finally {
      syncingRef.current = false
      setIsSyncingJumio(false)
    }
  }

  // Caso veredicto ya aprobado sin datos a la mano: una sola consulta GET
  // para obtener el documento extraído y luego sincronizar.
  const runJumioSyncFresh = async () => {
    if (!jumioAccountId || !jumioWorkflowId) return
    if (useJumioVerificationStore.getState().piiSynced) return
    if (syncingRef.current) return
    try {
      const statusData = await fetchJumioStatusOnce({
        accountId: jumioAccountId,
        workflowId: jumioWorkflowId,
        ...(jumioClientId ? { clientId: jumioClientId } : {}),
      })
      await runJumioSyncWithData(statusData)
    } catch (err) {
      setSyncError(
        err instanceof Error
          ? err.message
          : 'No se pudieron sincronizar los datos de tu INE al perfil.',
      )
    }
  }

  const runJumioCheck = async () => {
    if (!jumioAccountId || !jumioWorkflowId) return
    if (checkingRef.current) return
    checkingRef.current = true
    setIsCheckingJumio(true)
    setCheckProgress('')
    setError('')

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const result = await awaitJumioApproval({
        accountId: jumioAccountId,
        workflowId: jumioWorkflowId,
        ...(jumioClientId ? { clientId: jumioClientId } : {}),
        signal: controller.signal,
        onAttempt: (attempt, total) =>
          setCheckProgress(`Verificando tu identidad… (${attempt}/${total})`),
      })

      const store = useJumioVerificationStore.getState()
      if (result.valid) {
        store.markApproved()
        // Con el veredicto en mano se sincroniza de una vez al pii.
        await runJumioSyncWithData(result.data)
      } else store.markRejected(result.errorMessage)
    } catch (err) {
      if (controller.signal.aborted) return
      useJumioVerificationStore.getState().markError(
        err instanceof Error ? err.message : null,
      )
    } finally {
      checkingRef.current = false
      setIsCheckingJumio(false)
      setCheckProgress('')
    }
  }

  useEffect(() => {
    // Jumio corre en segundo plano desde UploadDocuments: si al llegar aquí
    // aún no hay veredicto, se sondea hasta el resultado final sin bloquear
    // la lectura de los documentos. Si ya está aprobado pero sus datos aún
    // no se mapearon al pii, se sincronizan.
    if (jumioStatus === 'pending' && jumioAccountId && jumioWorkflowId) {
      void runJumioCheck()
    } else if (jumioStatus === 'approved' && !piiSynced) {
      void runJumioSyncFresh()
    }
    return () => {
      checkingRef.current = false
      syncingRef.current = false
      abortRef.current?.abort()
    }
    // El store notifica los cambios vía suscripción (p. ej. el sondeo en
    // segundo plano de UploadDocuments resuelve mientras se lee esta vista).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumioStatus])

  useEffect(() => {
    if (modalDoc) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [modalDoc])

  const handleAcceptInModal = () => {
    if (modalDoc) {
      setAccepted(prev => ({ ...prev, [modalDoc]: true }))
      setModalDoc(null)
    }
  }

  const handleContinue = async () => {
    const nextStep = ROUTES.ONBOARDING.CREDIT_SELECTION
    try {
      setError('')

      // Sin veredicto positivo de Jumio no se avanza a CREDIT_SELECTION.
      if (!isJumioApproved) {
        if (isCheckingJumio || jumioStatus === 'pending') {
          setError('Tu INE aún está en proceso de validación. Espera a que termine para continuar.')
        } else if (jumioStatus === 'rejected') {
          setError('No se pudo validar tu INE. Regresa a documentos para intentarlo nuevamente.')
        } else {
          setError('Aún no se ha validado tu INE. Regresa a documentos para completar la validación.')
        }
        return
      }

      setIsSubmitting(true)
      await updateClientData({ pii: { paso_actual: nextStep } })

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

  const activeDoc = DOCUMENTS.find(d => d.id === modalDoc)

  return (
    <>
      <WrapperCard>
        <div className="flex flex-col gap-2">
          <TitleCard>
            Términos y condiciones
          </TitleCard>
          <SubtitleCard>
            Para continuar, lee y acepta los siguientes documentos legales.
          </SubtitleCard>
        </div>

        <div className="flex flex-col gap-3">
          {DOCUMENTS.map((doc) => {
            const checked = accepted[doc.id]
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => setModalDoc(doc.id)}
                className="w-full rounded-xl border border-border p-4 flex items-center gap-3 text-left transition hover:bg-secondary/50 active:scale-[0.99]"
              >
                <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="flex-1 text-sm font-semibold text-foreground">{doc.title}</span>
                <div className="relative shrink-0">
                  <div
                    className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition ${checked ? 'border-transparent bg-brand-accent' : 'border-border'}`}
                  >
                    {checked && (
                      <Check className="stroke-white w-4 h-4" />
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex flex-col gap-3">
          {isJumioApproved ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-md bg-emerald-500 flex items-center justify-center shrink-0">
                  <Check className="stroke-white w-4 h-4" />
                </div>
                <p className="text-xs font-medium text-foreground">
                  Identidad verificada correctamente. Puedes continuar.
                </p>
              </div>
              {isSyncingJumio && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sincronizando los datos de tu INE a tu perfil…
                </p>
              )}
              {syncError && !isSyncingJumio && (
                <>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Validación aprobada, pero no pudimos sincronizar tus datos al perfil: {syncError}
                  </p>
                  <ButtonCard
                    variant="secondary"
                    onClick={() => void runJumioSyncFresh()}
                    disabled={isSyncingJumio}
                    loading={isSyncingJumio}
                    loadingText="Sincronizando…"
                  >
                    Reintentar sincronización
                  </ButtonCard>
                </>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3 flex flex-col gap-2">
              {isCheckingJumio || jumioStatus === 'pending' ? (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {checkProgress || 'Validando tu INE… Esto puede tardar unos momentos.'}
                </p>
              ) : jumioStatus === 'rejected' ? (
                <>
                  <p className="text-xs text-destructive leading-relaxed">
                    No se pudo validar tu INE{jumioErrorMessage ? `: ${jumioErrorMessage}` : '.'} Sube nuevamente tus documentos para intentarlo de nuevo.
                  </p>
                  <ButtonCard
                    variant="secondary"
                    onClick={() => router.push(ROUTES.ONBOARDING.UPLOAD_DOCUMENTS)}
                  >
                    Volver a subir documentos
                  </ButtonCard>
                </>
              ) : jumioStatus === 'error' ? (
                <>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {jumioErrorMessage || 'No pudimos obtener el resultado de tu validación.'}
                  </p>
                  <ButtonCard
                    onClick={() => void runJumioCheck()}
                    disabled={isCheckingJumio}
                    loading={isCheckingJumio}
                    loadingText="Verificando…"
                  >
                    Reintentar verificación
                  </ButtonCard>
                  <ButtonCard
                    variant="secondary"
                    onClick={() => router.push(ROUTES.ONBOARDING.UPLOAD_DOCUMENTS)}
                  >
                    Volver a subir documentos
                  </ButtonCard>
                </>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Aún no hemos validado tu INE. Completa la carga de documentos para continuar.
                  </p>
                  <ButtonCard
                    variant="secondary"
                    onClick={() => router.push(ROUTES.ONBOARDING.UPLOAD_DOCUMENTS)}
                  >
                    Ir a documentos
                  </ButtonCard>
                </>
              )}
            </div>
          )}

          <ButtonCard
            onClick={handleContinue}
            disabled={!allAccepted || isSubmitting || isCheckingJumio || !isJumioApproved}
            loading={isSubmitting}
            loadingText="Guardando…"
          >
            Continuar
          </ButtonCard>
          <ButtonCard
            variant='secondary'
            disabled={isSubmitting || isCheckingJumio}
            onClick={() => router.push(ROUTES.ONBOARDING.CREDIT_AUTHORIZATION)}
          >
            Regresar
          </ButtonCard>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      </WrapperCard>

      {/* Document modal */}
      {activeDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl bg-background rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <h2 className="text-lg font-bold text-foreground truncate">{activeDoc.title}</h2>
              <button
                type="button"
                onClick={() => setModalDoc(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary transition"
                aria-label="Cerrar"
              >
                <X />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto px-6 py-5">
              <iframe
                src={activeDoc.url}
                className="w-full h-[calc(90vh-12rem)] rounded-lg border border-border"
                title={activeDoc.title}
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border shrink-0 flex flex-row gap-3">
              <ButtonCard
                variant="secondary"
                onClick={() => setModalDoc(null)}
              >
                Cancelar
              </ButtonCard>
              <ButtonCard
                onClick={handleAcceptInModal}
              >
                Aceptar y cerrar
              </ButtonCard>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
