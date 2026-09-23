'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ButtonCard } from '@/components/common/ButtonCard'
import { SubtitleCard } from '@/components/common/SubtitleCard'
import { TitleCard } from '@/components/common/TitleCard'
import { WrapperCard } from '@/components/common/WrapperCard'
import { X, Check, FileText } from '@/lib/icons'
import { ROUTES } from '@/lib/routes'
import { updateClientData } from '@/services/client-data'
import { DOCUMENTS } from './constants'

export default function TermsAcceptance() {
  const router = useRouter()
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
  const allAccepted = Object.values(accepted).every(Boolean)

  useEffect(() => {
    document.body.style.overflow = modalDoc ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [modalDoc])

  const handleAcceptInModal = () => {
    if (!modalDoc) return

    setAccepted((previous) => ({ ...previous, [modalDoc]: true }))
    setModalDoc(null)
  }

  const handleContinue = async () => {
    const nextStep = ROUTES.ONBOARDING.CREDIT_AUTHORIZATION

    try {
      setError('')
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

  const activeDoc = DOCUMENTS.find((document) => document.id === modalDoc)

  return (
    <>
      <WrapperCard>
        <div className="flex flex-col gap-2">
          <TitleCard>Términos y condiciones</TitleCard>
          <SubtitleCard>
            Para continuar, lee y acepta los siguientes documentos legales.
          </SubtitleCard>
        </div>

        <div className="flex flex-col gap-3">
          {DOCUMENTS.map((document) => {
            const checked = accepted[document.id]

            return (
              <button
                key={document.id}
                type="button"
                onClick={() => setModalDoc(document.id)}
                className="w-full rounded-xl border border-border p-4 flex items-center gap-3 text-left transition hover:bg-secondary/50 active:scale-[0.99]"
              >
                <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="flex-1 text-sm font-semibold text-foreground">
                  {document.title}
                </span>
                <div className="relative shrink-0">
                  <div
                    className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition ${checked ? 'border-transparent bg-brand-accent' : 'border-border'}`}
                  >
                    {checked ? <Check className="stroke-white w-4 h-4" /> : null}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex flex-col gap-3">
          <ButtonCard
            onClick={handleContinue}
            disabled={!allAccepted || isSubmitting}
            loading={isSubmitting}
            loadingText="Guardando…"
          >
            Continuar
          </ButtonCard>
          <ButtonCard
            variant="secondary"
            disabled={isSubmitting}
            onClick={() => router.push(ROUTES.ONBOARDING.UPLOAD_DOCUMENTS)}
          >
            Regresar
          </ButtonCard>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
      </WrapperCard>

      {activeDoc ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl bg-background rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <h2 className="text-lg font-bold text-foreground truncate">
                {activeDoc.title}
              </h2>
              <button
                type="button"
                onClick={() => setModalDoc(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary transition"
                aria-label="Cerrar"
              >
                <X />
              </button>
            </div>

            <div className="flex-1 overflow-auto px-6 py-5">
              {activeDoc.content ? (
                <div className="flex flex-col gap-5 text-sm leading-relaxed text-muted-foreground">
                  {activeDoc.content.paragraphs.slice(0, 2).map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}

                  {activeDoc.content.bullets ? (
                    <ul className="list-disc space-y-2 pl-5">
                      {activeDoc.content.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}

                  {activeDoc.content.paragraphs.slice(2).map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}

                  {activeDoc.content.sections?.map((section) => (
                    <section key={section.title} className="flex flex-col gap-2">
                      <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                      {section.text ? <p>{section.text}</p> : null}
                      {section.bullets ? (
                        <ul className="list-disc space-y-2 pl-5">
                          {section.bullets.map((bullet) => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                      ) : null}
                      {section.afterText ? <p>{section.afterText}</p> : null}
                    </section>
                  ))}

                  {activeDoc.content.legalNote ? (
                    <p className="rounded-xl border border-border bg-secondary/40 p-3 text-xs">
                      Nota legal: {activeDoc.content.legalNote}
                    </p>
                  ) : null}
                </div>
              ) : (
                <iframe
                  src={activeDoc.url}
                  className="w-full h-[calc(90vh-12rem)] rounded-lg border border-border"
                  title={activeDoc.title}
                />
              )}
            </div>

            <div className="px-6 py-4 border-t border-border shrink-0 flex flex-row gap-3">
              <ButtonCard variant="secondary" onClick={() => setModalDoc(null)}>
                Cancelar
              </ButtonCard>
              <ButtonCard onClick={handleAcceptInModal}>Aceptar y cerrar</ButtonCard>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
