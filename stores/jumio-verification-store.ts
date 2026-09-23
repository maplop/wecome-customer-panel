import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface JumioExtractedAddress {
  line1?: string
  line2?: string
  country?: string
  postalCode?: string
  subdivision?: string
  city?: string
}

export interface JumioVerificationResult {
  valid: boolean
  status?: string
  data?: {
    valid?: boolean
    workflowStatus?: string
    details?: {
      extractedData?: Array<{
        address?: JumioExtractedAddress
        nationality?: string
      }>
    }
  }
}

type JumioVerificationStatus = 'idle' | 'pending' | 'completed' | 'failed'

interface JumioVerificationStore {
  result: JumioVerificationResult | null
  status: JumioVerificationStatus
  setPending: () => void
  setResult: (result: unknown) => void
  setFailed: () => void
  clear: () => void
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

export function normalizeJumioVerificationResult(
  value: unknown,
): JumioVerificationResult {
  const source = isRecord(value) ? value : {}
  const data = isRecord(source.data) ? source.data : {}
  const details = isRecord(data.details) ? data.details : {}
  const extractedData = Array.isArray(details.extractedData)
    ? details.extractedData.flatMap((item) => {
      if (!isRecord(item)) return []
      const address = isRecord(item.address) ? item.address : {}
      return [{
        address: {
          line1: stringValue(address.line1),
          line2: stringValue(address.line2),
          country: stringValue(address.country),
          postalCode: stringValue(address.postalCode),
          subdivision: stringValue(address.subdivision),
          city: stringValue(address.city),
        },
        nationality: stringValue(item.nationality),
      }]
    })
    : undefined

  return {
    valid: source.valid === true,
    status: stringValue(source.status),
    data: {
      valid: data.valid === true,
      workflowStatus: stringValue(data.workflowStatus),
      details: { extractedData },
    },
  }
}

export function getJumioPiiData(result: JumioVerificationResult | null) {
  const identity = result?.data?.details?.extractedData?.[0]
  if (!identity) return null

  return {
    city: identity.address?.city,
    colony: identity.address?.line2,
    estado: identity.address?.subdivision,
    street: identity.address?.line1,
    country: identity.address?.country,
    zipcode: identity.address?.postalCode,
    nationality: identity.nationality,
  }
}

export const useJumioVerificationStore = create<JumioVerificationStore>()(
  persist(
    (set) => ({
      result: null,
      status: 'idle',
      setPending: () => set({ result: null, status: 'pending' }),
      setResult: (result) => {
        const normalizedResult = normalizeJumioVerificationResult(result)
        set({
          result: normalizedResult,
          status: normalizedResult.valid ? 'completed' : 'failed',
        })
      },
      setFailed: () => set({ status: 'failed' }),
      clear: () => set({ result: null, status: 'idle' }),
    }),
    {
      name: 'jumio-verification-store',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
