'use client'

import { useState, useRef } from 'react'

interface StepUploadDocumentsProps {
  onNext: (data: { documents: Record<string, string> }) => void
  onBack: () => void
}

interface DocumentType {
  id: string
  label: string
  required: boolean
  acceptedTypes: string
  step: 1 | 2
}

const DOCUMENT_TYPES: DocumentType[] = [
  // Step 1: Identity and credit documents
  { id: 'ine', label: 'INE', required: true, acceptedTypes: '.jpg,.jpeg,.png,.pdf', step: 1 },
  { id: 'comprobante-domicilio', label: 'Comprobante de domicilio', required: true, acceptedTypes: '.jpg,.jpeg,.png,.pdf', step: 1 },
  { id: 'autorizacion-historial', label: 'Autorización de historial crediticio', required: true, acceptedTypes: '.pdf', step: 1 },
  { id: 'reporte-credito', label: 'Reporte de crédito consolidado', required: true, acceptedTypes: '.pdf', step: 1 },
  { id: 'aviso-privacidad', label: 'Aviso de privacidad wecom', required: true, acceptedTypes: '.pdf', step: 1 },
  // Step 2: Authorization and agreements
  { id: 'autorizacion-publicidad', label: 'Autorización de publicidad', required: true, acceptedTypes: '.pdf', step: 2 },
  { id: 'autorizacion-seguro', label: 'Autorización de seguro Wecom', required: true, acceptedTypes: '.pdf', step: 2 },
  { id: 'autorizacion-sic', label: 'Autorización SIC 2', required: true, acceptedTypes: '.pdf', step: 2 },
  { id: 'pagare', label: 'Pagaré', required: true, acceptedTypes: '.pdf', step: 2 },
]

export default function StepUploadDocuments({ onNext, onBack }: StepUploadDocumentsProps) {
  const [internalStep, setInternalStep] = useState(1)
  const [documents, setDocuments] = useState<Record<string, { name: string; preview: string }>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState<string | null>(null)
  const fileInputs = useRef<Record<string, HTMLInputElement>>({})

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
    fileInputs.current[docId]?.click()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const currentStepDocs = DOCUMENT_TYPES.filter(d => d.step === internalStep && d.required)
    const newErrors: Record<string, string> = {}

    currentStepDocs.forEach(d => {
      if (!documents[d.id]) {
        newErrors[d.id] = 'Documento requerido'
      }
    })

    if (Object.keys(newErrors).length) {
      setErrors(newErrors)
      return
    }

    // If on step 1 and valid, move to step 2
    if (internalStep === 1) {
      setInternalStep(2)
      return
    }

    // If on step 2, validate all documents and submit
    const allErrors: Record<string, string> = {}
    DOCUMENT_TYPES.filter(d => d.required).forEach(d => {
      if (!documents[d.id]) {
        allErrors[d.id] = 'Documento requerido'
      }
    })

    if (Object.keys(allErrors).length) {
      setErrors(allErrors)
      return
    }

    const documentData = Object.fromEntries(
      Object.entries(documents).map(([key, value]) => [key, value.name])
    )
    onNext({ documents: documentData })
  }

  const currentStepDocs = DOCUMENT_TYPES.filter(d => d.step === internalStep)
  const currentStepComplete = DOCUMENT_TYPES.filter(d => d.step === internalStep && d.required).every(d => documents[d.id])
  const allComplete = DOCUMENT_TYPES.filter(d => d.required).every(d => documents[d.id])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground text-balance">
          Sube tus documentos
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {internalStep === 1
            ? 'Sube tu identidad, domicilio y autorización crediticia.'
            : 'Ahora sube las autorizaciones y acuerdos finales.'}
        </p>
        <div className="flex gap-2 mt-2">
          <div className={`h-1 flex-1 rounded-full transition-all ${internalStep >= 1 ? 'bg-accent' : 'bg-border'}`} />
          <div className={`h-1 flex-1 rounded-full transition-all ${internalStep >= 2 ? 'bg-accent' : 'bg-border'}`} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {currentStepDocs.map((doc) => (
          <div key={doc.id} className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">
              {doc.label} {doc.required && <span className="text-destructive">*</span>}
            </label>

            {documents[doc.id] ? (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/50">
                {documents[doc.id].preview.startsWith('data:image') ? (
                  <img
                    src={documents[doc.id].preview}
                    alt={doc.label}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
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
              <label className="flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 transition cursor-pointer">
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

        <button
          type="submit"
          disabled={!currentStepComplete}
          className={`w-full rounded-xl py-3.5 text-sm font-semibold text-white transition active:scale-[0.98] ${currentStepComplete ? 'hover:opacity-90' : 'opacity-50 cursor-not-allowed'}`}
          style={{ backgroundColor: currentStepComplete ? '#E1941F' : '#9ca3af' }}
        >
          {internalStep === 1 ? 'Siguiente' : 'Completar'}
        </button>
      </form>

      <button
        type="button"
        onClick={internalStep === 2 ? () => setInternalStep(1) : onBack}
        className="w-full rounded-xl border border-border py-3.5 text-sm font-medium text-foreground transition hover:bg-secondary active:scale-[0.98]"
      >
        {internalStep === 2 ? 'Atrás' : 'Regresar'}
      </button>
    </div>
  )
}