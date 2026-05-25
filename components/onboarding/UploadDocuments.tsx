'use client'

import { useState, useRef } from 'react'
import { WrapperCard, TitleCard, SubtitleCard, ButtonCard } from '../common'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'
import router from 'next/dist/shared/lib/router/router'

interface DocumentType {
  id: string
  label: string
  required: boolean
  acceptedTypes: string
  tab: 1 | 2
}

const DOCUMENT_TYPES: DocumentType[] = [
  { id: 'ine-frontal', label: 'INE (Parte frontal)', required: true, acceptedTypes: '.jpg,.jpeg,.png,.pdf', tab: 1 },
  { id: 'ine-trasera', label: 'INE (Parte trasera)', required: true, acceptedTypes: '.jpg,.jpeg,.png,.pdf', tab: 1 },
  { id: 'comprobante-domicilio', label: 'Comprobante de domicilio', required: true, acceptedTypes: '.jpg,.jpeg,.png,.pdf', tab: 1 },
  { id: 'recibo-nomina-1', label: 'Recibo de nómina (1er más reciente)', required: true, acceptedTypes: '.jpg,.jpeg,.png,.pdf', tab: 2 },
  { id: 'recibo-nomina-2', label: 'Recibo de nómina (2do más reciente)', required: true, acceptedTypes: '.jpg,.jpeg,.png,.pdf', tab: 2 },
  { id: 'recibo-nomina-3', label: 'Recibo de nómina (3er más reciente)', required: true, acceptedTypes: '.jpg,.jpeg,.png,.pdf', tab: 2 },
]

const TABS = [
  { id: 1, label: 'Identificación' },
  { id: 2, label: 'Recibos de nómina' },
]

export default function UploadDocuments() {
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<1 | 2>(1)
  const [documents, setDocuments] = useState<Record<string, { name: string; preview: string }>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState<string | null>(null)
  const fileInputs = useRef<Record<string, HTMLInputElement>>({})

  const currentTabDocs = DOCUMENT_TYPES.filter(d => d.tab === activeTab)
  const tab1Docs = DOCUMENT_TYPES.filter(d => d.tab === 1)
  const tab2Docs = DOCUMENT_TYPES.filter(d => d.tab === 2)
  const tab1Complete = tab1Docs.filter(d => d.required).every(d => !!documents[d.id])
  const tab2Complete = tab2Docs.filter(d => d.required).every(d => !!documents[d.id])
  const allRequiredUploaded = tab1Complete && tab2Complete

  const handleFileChange = (docId: string, file: File | null) => {
    if (!file) return

    const validTypes = DOCUMENT_TYPES.find(d => d.id === docId)?.acceptedTypes.split(',') || []
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()

    if (!validTypes.includes(ext)) {
      setErrors(e => ({ ...e, [docId]: 'Tipo de archivo no válido' }))
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors(e => ({ ...e, [docId]: 'El archivo no debe superar 10MB' }))
      return
    }

    setUploading(docId)
    const reader = new FileReader()
    reader.onload = (e) => {
      const preview = e.target?.result as string
      setDocuments(d => ({ ...d, [docId]: { name: file.name, preview } }))
      setErrors(e => ({ ...e, [docId]: '' }))
      setUploading(null)
    }
    reader.readAsDataURL(file)
  }

  const removeDocument = (docId: string) => {
    setDocuments(d => {
      const newDocs = { ...d }
      delete newDocs[docId]
      return newDocs
    })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    DOCUMENT_TYPES.filter(d => d.required).forEach(d => {
      if (!documents[d.id]) newErrors[d.id] = 'Documento requerido'
    })

    if (Object.keys(newErrors).length) {
      const hasTab1Errors = tab1Docs.some(d => newErrors[d.id])
      if (hasTab1Errors) setActiveTab(1)
      setErrors(newErrors)
      return
    }

    router.push(ROUTES.ONBOARDING.FINANCIAL_DATA)
  }

  return (
    <WrapperCard>
      <div className="flex flex-col gap-2">
        <TitleCard>
          Sube tus documentos
        </TitleCard>
        <SubtitleCard>
          Sube los documentos requeridos para continuar con tu solicitud.
        </SubtitleCard>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-secondary">
        {TABS.map(tab => {
          const isComplete = tab.id === 1 ? tab1Complete : tab2Complete
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as 1 | 2)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition ${activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {tab.label}
              {isComplete && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-500">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          )
        })}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {currentTabDocs.map((doc) => (
          <div key={doc.id} className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">
              {doc.label} {doc.required && <span className="text-destructive">*</span>}
            </label>

            {documents[doc.id] ? (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/50">
                {documents[doc.id].preview.startsWith('data:image') ? (
                  <img src={documents[doc.id].preview} alt={doc.label} className="w-12 h-12 object-cover rounded-lg" />
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-muted">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{documents[doc.id].name}</p>
                  <p className="text-xs text-muted-foreground">Cargado exitosamente</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeDocument(doc.id)}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-20 rounded-xl border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 transition cursor-pointer">
                <input
                  ref={(el) => { fileInputs.current[doc.id] = el! }}
                  type="file"
                  accept={doc.acceptedTypes}
                  className="hidden"
                  onChange={(e) => handleFileChange(doc.id, e.target.files?.[0] || null)}
                />
                {uploading === doc.id ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Cargando...
                  </div>
                ) : (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground mb-2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                    <span className="text-xs text-muted-foreground">Haz click para subir</span>
                  </>
                )}
              </label>
            )}
            {errors[doc.id] && <p className="text-xs text-destructive">{errors[doc.id]}</p>}
          </div>
        ))}

        <div className="flex flex-col gap-3">
          {/* Navegación entre tabs o submit */}
          {activeTab === 1 ? (
            <ButtonCard
              onClick={() => setActiveTab(2)}
              disabled={!tab1Complete}
            >
              Siguiente
            </ButtonCard>
          ) : (

            <ButtonCard
              submit
              disabled={!allRequiredUploaded}
            >
              Completar
            </ButtonCard>
          )}

          <ButtonCard
            variant="secondary"
            onClick={activeTab === 2 ? () => setActiveTab(1) : () => router.push(ROUTES.ONBOARDING.PERSONAL_DATA)}
          >
            {activeTab === 2 ? 'Atrás' : 'Regresar'}
          </ButtonCard>
        </div>
      </form>

    </WrapperCard>
  )
}
