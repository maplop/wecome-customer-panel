'use client'

import { useState } from 'react'
import { WrapperCard, TitleCard, SubtitleCard, ButtonCard } from '../../common'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'
import { Check } from '@/lib/icons'
import DocumentUploadField from './DocumentUploadField'
import { upload as uploadToS3 } from '@/utils/aws/s3'
import { updateClientData } from '@/services/client-data'
import { useClientDataStore } from '@/stores/client-data-store'

interface DocumentType {
  id: string
  piiKey: string
  valueName: string
  label: string
  required: boolean
  acceptedTypes: string
  tab: 1 | 2
}

const DOCUMENT_TYPES: DocumentType[] = [
  { id: 'ine-frontal', piiKey: 'ine', valueName: 'ine_frontal', label: 'INE (Parte frontal)', required: true, acceptedTypes: '.jpg,.jpeg,.png,.pdf', tab: 1 },
  { id: 'ine-trasera', piiKey: 'ine', valueName: 'ine_trasera', label: 'INE (Parte trasera)', required: true, acceptedTypes: '.jpg,.jpeg,.png,.pdf', tab: 1 },
  { id: 'comprobante-domicilio', piiKey: 'comprobante_de_domicilio', valueName: 'comprobante_de_domicilio', label: 'Comprobante de domicilio', required: true, acceptedTypes: '.jpg,.jpeg,.png,.pdf', tab: 1 },
  { id: 'recibo-nomina-1', piiKey: 'recibo_de_nomina_1', valueName: 'recibo_de_nomina_1', label: 'Recibo de nomina (1er mas reciente)', required: true, acceptedTypes: '.jpg,.jpeg,.png,.pdf', tab: 2 },
  { id: 'recibo-nomina-2', piiKey: 'recibo_de_nomina_2', valueName: 'recibo_de_nomina_2', label: 'Recibo de nomina (2do mas reciente)', required: true, acceptedTypes: '.jpg,.jpeg,.png,.pdf', tab: 2 },
  { id: 'recibo-nomina-3', piiKey: 'recibo_de_nomina_3', valueName: 'recibo_de_nomina_3', label: 'Recibo de nomina (3er mas reciente)', required: true, acceptedTypes: '.jpg,.jpeg,.png,.pdf', tab: 2 },
]

const TABS = [
  { id: 1, label: 'Identificacion' },
  { id: 2, label: 'Recibos de nomina' },
]

interface UploadedDocumentValue {
  active: boolean
  metadata: Record<string, unknown>
  name: string
  uploaded: number
  url: string
}

interface UploadedDocumentState {
  name: string
  preview: string
  value: UploadedDocumentValue[]
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => resolve(String(event.target?.result || ''))
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'))
    reader.readAsDataURL(file)
  })
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_')
}

export default function UploadDocuments() {
  const router = useRouter()
  const client = useClientDataStore((state) => state.client)

  const [activeTab, setActiveTab] = useState<1 | 2>(1)
  const [documents, setDocuments] = useState<Record<string, UploadedDocumentState>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const currentTabDocs = DOCUMENT_TYPES.filter((d) => d.tab === activeTab)
  const tab1Docs = DOCUMENT_TYPES.filter((d) => d.tab === 1)
  const tab2Docs = DOCUMENT_TYPES.filter((d) => d.tab === 2)
  const tab1Complete = tab1Docs.filter((d) => d.required).every((d) => !!documents[d.id])
  const tab2Complete = tab2Docs.filter((d) => d.required).every((d) => !!documents[d.id])
  const allRequiredUploaded = tab1Complete && tab2Complete

  const handleFileChange = async (docId: string, file: File | null, acceptedTypes: string) => {
    if (!file) return

    const docConfig = DOCUMENT_TYPES.find((doc) => doc.id === docId)
    if (!docConfig) return

    const validTypes = acceptedTypes.split(',')
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()

    if (!validTypes.includes(ext)) {
      setErrors((e) => ({ ...e, [docId]: 'Tipo de archivo no valido' }))
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors((e) => ({ ...e, [docId]: 'El archivo no debe superar 10MB' }))
      return
    }

    if (!client?.company) {
      setErrors((e) => ({
        ...e,
        [docId]: 'No se encontro la compania del cliente para subir archivos.',
      }))
      return
    }

    setSubmitError('')
    setErrors((e) => ({ ...e, [docId]: '' }))
    setUploading(docId)

    try {
      const key = `company/${client.company}/onboarding/${docId}/${Date.now()}-${sanitizeFilename(file.name)}`
      const uploadedFile = await uploadToS3(
        key,
        file,
        {
          documentId: docId,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
        },
        String(client.company),
      )

      const preview = await fileToDataUrl(file)
      const uploadedAt = Date.now()

      const value: UploadedDocumentValue[] = [
        {
          active: true,
          metadata: {
            size: file.size,
            type: file.type,
            originalName: file.name,
            extension: ext,
          },
          name: docConfig.valueName,
          uploaded: uploadedAt,
          url: uploadedFile.Location,
        },
      ]

      setDocuments((d) => ({ ...d, [docId]: { name: file.name, preview, value } }))
      setErrors((e) => ({ ...e, [docId]: '' }))
    } catch {
      setErrors((e) => ({ ...e, [docId]: 'No se pudo cargar el documento. Intenta nuevamente.' }))
    } finally {
      setUploading(null)
    }
  }

  const removeDocument = (docId: string) => {
    setDocuments((d) => {
      const nextDocs = { ...d }
      delete nextDocs[docId]
      return nextDocs
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    DOCUMENT_TYPES.filter((d) => d.required).forEach((d) => {
      if (!documents[d.id]) newErrors[d.id] = 'Documento requerido'
    })

    if (Object.keys(newErrors).length) {
      const hasTab1Errors = tab1Docs.some((d) => newErrors[d.id])
      if (hasTab1Errors) setActiveTab(1)
      setErrors(newErrors)
      return
    }

    try {
      setIsSubmitting(true)
      setSubmitError('')

      const piiPayload: Record<string, unknown> = {}
      DOCUMENT_TYPES.forEach((doc) => {
        const item = documents[doc.id]
        if (item?.value?.length) {
          if (doc.piiKey === 'ine') {
            const current = Array.isArray(piiPayload.ine)
              ? (piiPayload.ine as UploadedDocumentValue[])
              : []
            piiPayload.ine = [...current, ...item.value]
          } else {
            piiPayload[doc.piiKey] = item.value
          }
        }
      })
      piiPayload.current_step = ROUTES.ONBOARDING.FINANCIAL_DATA

      await updateClientData({
        pii: piiPayload,
      })

      router.push(ROUTES.ONBOARDING.FINANCIAL_DATA)
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'No se pudieron guardar los documentos. Intenta nuevamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <WrapperCard>
      <div className="flex flex-col gap-2">
        <TitleCard>Sube tus documentos</TitleCard>
        <SubtitleCard>
          Sube los documentos requeridos para continuar con tu solicitud.
        </SubtitleCard>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-secondary">
        {TABS.map((tab) => {
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
              {isComplete && <Check className="text-emerald-500 w-5 h-5" />}
            </button>
          )
        })}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {currentTabDocs.map((doc) => (
          <DocumentUploadField
            key={doc.id}
            docId={doc.id}
            label={doc.label}
            required={doc.required}
            acceptedTypes={doc.acceptedTypes}
            fileData={documents[doc.id]}
            error={errors[doc.id]}
            uploading={uploading === doc.id}
            disabled={Boolean(uploading) || isSubmitting}
            onFileChange={handleFileChange}
            onRemove={removeDocument}
          />
        ))}

        {submitError && <p className="text-sm text-destructive">{submitError}</p>}

        <div className="flex flex-col gap-3">
          {activeTab === 1 ? (
            <ButtonCard
              onClick={() => setActiveTab(2)}
              disabled={!tab1Complete || Boolean(uploading) || isSubmitting}
            >
              Siguiente
            </ButtonCard>
          ) : (
            <ButtonCard
              submit
              disabled={!allRequiredUploaded || Boolean(uploading) || isSubmitting}
              loading={isSubmitting}
              loadingText="Guardando..."
            >
              Completar
            </ButtonCard>
          )}

          <ButtonCard
            variant="secondary"
            disabled={Boolean(uploading) || isSubmitting}
            onClick={activeTab === 2
              ? () => setActiveTab(1)
              : () => router.push(ROUTES.ONBOARDING.PERSONAL_DATA)}
          >
            {activeTab === 2 ? 'Atras' : 'Regresar'}
          </ButtonCard>
        </div>
      </form>
    </WrapperCard>
  )
}
