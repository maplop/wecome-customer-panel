'use client'

import { useState, useEffect } from 'react'
import { ButtonCard } from '@/components/common/ButtonCard'
import { SubtitleCard } from '@/components/common/SubtitleCard'
import { TitleCard } from '@/components/common/TitleCard'
import { WrapperCard } from '@/components/common/WrapperCard'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'
import { X, Check, FileText } from '@/lib/icons'
import { updateClientData } from '@/services/client-data'

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

  const [accepted, setAccepted] = useState<Record<string, boolean>>({
    advertising: false,
    transparency: false,
    privacy: false,
    insurance: false,
    terms: false,
  })
  const [modalDoc, setModalDoc] = useState<string | null>(null)
  const [error, setError] = useState('')

  const allAccepted = Object.values(accepted).every(Boolean)

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
    const nextStep = ROUTES.ONBOARDING.CREDIT_AUTHORIZATION
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
          <ButtonCard
            onClick={handleContinue}
            disabled={!allAccepted}
          >
            Continuar
          </ButtonCard>
          <ButtonCard
            variant='secondary'
            onClick={() => router.push(ROUTES.ONBOARDING.UPLOAD_DOCUMENTS)}
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