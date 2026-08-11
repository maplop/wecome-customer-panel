'use client'

import { useEffect, useState } from 'react'
import { WrapperCard } from '@/components/common/WrapperCard'
import { TitleCard } from '@/components/common/TitleCard'
import { SubtitleCard } from '@/components/common/SubtitleCard'
import { ButtonCard } from '@/components/common/ButtonCard'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'
import { Check } from '@/lib/icons'
import DocumentUploadField from './DocumentUploadField'
import { getSignedUrl, upload as uploadToS3 } from '@/utils/aws/s3'
import { updateClientData } from '@/services/client-data'
import { verifyIneWithJumio } from '@/services/onboarding/jumio'
import { useClientDataStore } from '@/stores/client-data-store'
import { updateActiveRequestData } from '@/services/client-requests'
import { toast } from '@/hooks/use-toast'

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
  { id: 'recibo-nomina-1', piiKey: 'recibo_de_nomina_1', valueName: 'recibo_de_nomina_1', label: 'Recibo de nómina (1er más reciente)', required: true, acceptedTypes: '.jpg,.jpeg,.png,.pdf', tab: 2 },
  { id: 'recibo-nomina-2', piiKey: 'recibo_de_nomina_2', valueName: 'recibo_de_nomina_2', label: 'Recibo de nómina (2do más reciente)', required: true, acceptedTypes: '.jpg,.jpeg,.png,.pdf', tab: 2 },
  { id: 'recibo-nomina-3', piiKey: 'recibo_de_nomina_3', valueName: 'recibo_de_nomina_3', label: 'Recibo de nómina (3er más reciente)', required: true, acceptedTypes: '.jpg,.jpeg,.png,.pdf', tab: 2 },
]

const TABS = [
  { id: 1, label: 'Identificación' },
  { id: 2, label: 'Recibos de nómina' },
]

const INE_FRONT_DOC_ID = 'ine-frontal'
const INE_BACK_DOC_ID = 'ine-trasera'
const TOAST_DURATION_INFO_MS = 7000
const TOAST_DURATION_RESULT_MS = 9000

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

interface StoredDocumentValue {
  active?: boolean
  metadata?: Record<string, unknown>
  name?: string
  uploaded?: number
  url?: string
}

type DocumentsStateMap = Record<string, UploadedDocumentState>

function isValidUrl(url: string): boolean {
  const trimmed = url.trim()
  if (!trimmed) return false
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) return false
  if (trimmed === 'null' || trimmed === 'undefined') return false
  return true
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

function getFilenameFromUrl(url: string): string {
  const pathname = url.split('?')[0]
  const parts = pathname.split('/')
  return parts[parts.length - 1] || 'documento'
}

function normalizeStoredDocumentValue(
  item: unknown,
  fallbackName: string,
): UploadedDocumentValue | null {
  if (!item) return null

  if (typeof item === 'string') {
    const cleanUrl = item.trim()
    if (!isValidUrl(cleanUrl)) return null
    return {
      active: true,
      metadata: {},
      name: fallbackName,
      uploaded: Date.now(),
      url: cleanUrl,
    }
  }

  if (typeof item !== 'object') return null

  const raw = item as StoredDocumentValue
  const cleanUrl = typeof raw.url === 'string' ? raw.url.trim() : ''
  if (!isValidUrl(cleanUrl)) return null

  return {
    active: raw.active ?? true,
    metadata: raw.metadata ?? {},
    name: raw.name || fallbackName,
    uploaded: typeof raw.uploaded === 'number' ? raw.uploaded : Date.now(),
    url: cleanUrl,
  }
}

function parseFieldValue(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed)
        return Array.isArray(parsed) ? parsed : [parsed]
      } catch {
        return trimmed ? [trimmed] : []
      }
    }
    return trimmed ? [trimmed] : []
  }
  return raw != null ? [raw] : []
}

function buildInitialDocuments(
  pii: Record<string, unknown> | undefined,
): Record<string, UploadedDocumentState> {
  if (!pii) return {}

  const initial: Record<string, UploadedDocumentState> = {}

  DOCUMENT_TYPES.forEach((doc) => {
    const rawFieldValue = pii[doc.piiKey]
    const values = parseFieldValue(rawFieldValue)
    const normalizedValues = values
      .map((item) => normalizeStoredDocumentValue(item, doc.valueName))
      .filter((item): item is UploadedDocumentValue => Boolean(item && item.active))

    const selected =
      doc.piiKey === 'ine'
        ? normalizedValues.find((item) => item.name === doc.valueName)
        : normalizedValues[0]

    if (!selected?.url) return

    const metadataOriginalName =
      typeof selected.metadata?.originalName === 'string'
        ? selected.metadata.originalName
        : ''
    const displayName = metadataOriginalName || getFilenameFromUrl(selected.url)

    initial[doc.id] = {
      name: displayName,
      preview: selected.url,
      value: [selected],
    }
  })

  return initial
}

async function resolveSignedUrl(url: string): Promise<string> {
  try {
    const signed = await getSignedUrl(url)
    if (typeof signed === 'string') return signed
    if (signed && typeof signed === 'object' && 'url' in signed) {
      return String(signed.url || url)
    }
    return url
  } catch {
    return url
  }
}

function buildDocumentsPiiPayload(
  docsMap: DocumentsStateMap,
): Record<string, unknown> {
  const piiPayload: Record<string, unknown> = {
    ine: [],
    comprobante_de_domicilio: [],
    recibo_de_nomina_1: [],
    recibo_de_nomina_2: [],
    recibo_de_nomina_3: [],
  }

  DOCUMENT_TYPES.forEach((doc) => {
    const item = docsMap[doc.id]
    if (!item?.value?.length) return

    // Filtrar valores con URL inválida antes de guardar
    const validValues = item.value.filter((v) => isValidUrl(v.url))
    if (!validValues.length) return

    if (doc.piiKey === 'ine') {
      const current = Array.isArray(piiPayload.ine)
        ? (piiPayload.ine as UploadedDocumentValue[])
        : []
      piiPayload.ine = [...current, ...validValues]
      return
    }

    piiPayload[doc.piiKey] = validValues
  })

  return piiPayload
}

export default function UploadDocuments() {
  const router = useRouter()
  const client = useClientDataStore((state) => state.client)

  const [activeTab, setActiveTab] = useState<1 | 2>(1)
  const [documents, setDocuments] = useState<Record<string, UploadedDocumentState>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState<Set<string>>(new Set())

  const isUploading = (docId: string) => uploading.has(docId)
  const [loadingExistingDocs, setLoadingExistingDocs] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [removingDocumentId, setRemovingDocumentId] = useState<string | null>(null)
  const [jumioFailures, setJumioFailures] = useState<Record<string, boolean>>({})
  const [submitProgress, setSubmitProgress] = useState(0)
  const [submitError, setSubmitError] = useState('')
  const [hydratedFromPii, setHydratedFromPii] = useState(false)

  const currentTabDocs = DOCUMENT_TYPES.filter((d) => d.tab === activeTab)
  const tab1Docs = DOCUMENT_TYPES.filter((d) => d.tab === 1)
  const tab2Docs = DOCUMENT_TYPES.filter((d) => d.tab === 2)
  const tab1Complete = tab1Docs.filter((d) => d.required).every((d) => !!documents[d.id])
  const tab2Complete = tab2Docs.filter((d) => d.required).every((d) => !!documents[d.id])
  const allRequiredUploaded = tab1Complete && tab2Complete

  useEffect(() => {
    if (hydratedFromPii) return
    const pii = (client?.pii as Record<string, unknown> | undefined)
    if (!pii) return

    let cancelled = false

    const hydrate = async () => {
      const initialDocs = buildInitialDocuments(pii)
      const initialKeys = Object.keys(initialDocs)
      if (initialKeys.length) {
        const initialLoadingState = Object.fromEntries(
          initialKeys.map((key) => [key, true]),
        ) as Record<string, boolean>
        setLoadingExistingDocs(initialLoadingState)
      }

      const entries = await Promise.all(
        Object.entries(initialDocs).map(async ([key, item]) => {
          const signedPreview = await resolveSignedUrl(item.preview)
          setLoadingExistingDocs((prev) => ({ ...prev, [key]: false }))
          return [
            key,
            {
              ...item,
              preview: signedPreview,
            },
          ] as const
        }),
      )

      if (cancelled) return

      const signedDocs = Object.fromEntries(entries)
      setDocuments((current) =>
        Object.keys(current).length ? current : signedDocs,
      )
      setLoadingExistingDocs({})
      setHydratedFromPii(true)
    }

    void hydrate()

    return () => {
      cancelled = true
    }
  }, [client?.pii, hydratedFromPii])

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
        [docId]: 'No se encontró la compañía del cliente para subir archivos.',
      }))
      return
    }

    setSubmitError('')
    setErrors((e) => ({ ...e, [docId]: '' }))
    if (docId === INE_FRONT_DOC_ID || docId === INE_BACK_DOC_ID) {
      setJumioFailures((prev) => ({ ...prev, [docId]: false }))
    }
    setUploading(prev => new Set(prev).add(docId))

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
      setUploading(prev => { const next = new Set(prev); next.delete(docId); return next; })
    }
  }

  const removeDocument = (docId: string) => {
    const persistRemoval = async () => {
      if (removingDocumentId || isSubmitting) return

      const previousDocuments = documents
      const nextDocuments = { ...previousDocuments }
      delete nextDocuments[docId]

      setSubmitError('')
      setErrors((e) => ({ ...e, [docId]: '' }))
      if (docId === INE_FRONT_DOC_ID || docId === INE_BACK_DOC_ID) {
        setJumioFailures((prev) => ({ ...prev, [docId]: false }))
      }
      setDocuments(nextDocuments)
      setRemovingDocumentId(docId)

      try {
        await updateClientData({
          pii: buildDocumentsPiiPayload(nextDocuments),
        })
      } catch (error) {
        setDocuments(previousDocuments)
        setSubmitError(
          error instanceof Error
            ? error.message
            : 'No se pudo eliminar el documento. Intenta nuevamente.',
        )
      } finally {
        setRemovingDocumentId(null)
      }
    }

    void persistRemoval()
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const nextStep = ROUTES.ONBOARDING.TERMS_ACCEPTANCE

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

      const ineFrontDoc = documents[INE_FRONT_DOC_ID]
      const ineBackDoc = documents[INE_BACK_DOC_ID]
      const clientRecord = (client ?? {}) as Record<string, unknown>
      const entities = (clientRecord.entities ?? {}) as Record<string, unknown>


      const jumioClientId = String(
        entities.peopleId ?? clientRecord.id ?? clientRecord.external_id ?? '',
      )

      if (!jumioClientId) {
        setSubmitError('No se encontró el identificador del cliente para validar INE.')
        return
      }

      const jumioResult = await verifyIneWithJumio({
        clientId: jumioClientId,
        frontImage: String(ineFrontDoc?.value?.[0]?.url || ''),
        backImage: String(ineBackDoc?.value?.[0]?.url || ''),
        awaitFinalStatus: false,
        onStatusResolved: (result) => {
          if (result.valid) {
            toast({
              title: 'Validación de INE completada',
              description: 'Tu INE fue validado correctamente.',
              duration: TOAST_DURATION_RESULT_MS,
            })
            return
          }

          toast({
            variant: 'destructive',
            title: 'Resultado de validación de INE',
            description: 'No se pudo validar tu INE. Te contactaremos con los siguientes pasos.',
            duration: TOAST_DURATION_RESULT_MS,
          })
        },
        onStatusError: () => {
          toast({
            variant: 'destructive',
            title: 'Validación de INE pendiente',
            description: 'No pudimos obtener un resultado final de tu INE por ahora. Lo reintentaremos.',
            duration: TOAST_DURATION_RESULT_MS,
          })
        },
      })

      toast({
        title: 'Documentación enviada',
        description: 'Tu INE será validado en segundo plano mientras continúas con tu solicitud.',
        duration: TOAST_DURATION_INFO_MS,
      })

      if (!jumioResult.valid) {
        setActiveTab(1)
        setJumioFailures({
          [INE_FRONT_DOC_ID]: true,
          [INE_BACK_DOC_ID]: true,
        })
        setErrors((prev) => ({
          ...prev,
          [INE_FRONT_DOC_ID]: 'No se pudo validar el INE. Verifica que las fotos sean legibles.',
          [INE_BACK_DOC_ID]: 'No se pudo validar el INE. Verifica que las fotos sean legibles.',
        }))
        setSubmitError('No se pudo validar el INE. Intenta subirlo nuevamente.')
        return
      }

      setJumioFailures({
        [INE_FRONT_DOC_ID]: false,
        [INE_BACK_DOC_ID]: false,
      })

      const piiPayload = buildDocumentsPiiPayload(documents)

      await updateClientData(
        {
          pii: piiPayload,
        },
      )

      await updateActiveRequestData({
        paso_actual: nextStep,
      })

      router.push(nextStep)
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
            error={errors[doc.id] || (jumioFailures[doc.id] ? 'No se pudo validar el INE.' : '')}
            uploading={isUploading(doc.id)}
            loadingExisting={Boolean(loadingExistingDocs[doc.id])}
            disabled={isUploading(doc.id) || isSubmitting || Boolean(removingDocumentId) || Boolean(loadingExistingDocs[doc.id])}
            onFileChange={handleFileChange}
            onRemove={removeDocument}
          />
        ))}

        {submitError && <p className="text-sm text-destructive">{submitError}</p>}

        <div className="flex flex-col gap-3">
          {activeTab === 1 ? (
            <ButtonCard
              onClick={() => setActiveTab(2)}
              disabled={!tab1Complete || uploading.size > 0 || isSubmitting || Boolean(removingDocumentId)}
            >
              Siguiente
            </ButtonCard>
          ) : (
            <ButtonCard
              submit
              disabled={!allRequiredUploaded || uploading.size > 0 || isSubmitting || Boolean(removingDocumentId)}
              loading={isSubmitting}
              loadingText="Subiendo documentos..."
            >
              Subir documentos
            </ButtonCard>
          )}

          <ButtonCard
            variant="secondary"
            disabled={uploading.size > 0 || isSubmitting || Boolean(removingDocumentId)}
            onClick={activeTab === 2
              ? () => setActiveTab(1)
              : () => router.push(ROUTES.ONBOARDING.PERSONAL_DATA)}
          >
            {activeTab === 2 ? 'Regresar' : 'Regresar'}
          </ButtonCard>
        </div>
      </form>
    </WrapperCard>
  )
}
