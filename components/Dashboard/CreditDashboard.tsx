'use client'

import { useMemo, useState } from 'react'
import { ButtonCard } from '@/components/common'
import { CreditDetailModal, ClientRequestItem } from './components'
import { Plus } from '@/lib/icons'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'
import { useClientDataStore } from '@/stores/client-data-store'
import { useClientRequestStore } from '@/stores'
import type { RequestStatus, ClientRequestRecord } from '@/types/client-request'
import { addRequest } from '@/services/client-requests'
import { TitleCard, SubtitleCard } from '@/components/common'

export type TabFilter = RequestStatus | 'all'

const TAB_LABELS: Record<TabFilter, string> = {
  all: 'Todos',
  pending: 'Pendientes',
  resolved: 'Resueltos',
  approved: 'Aprobados',
  active: 'Activos',
  completed: 'Finalizados',
  denied: 'Denegados'
}

const TABS = Object.keys(TAB_LABELS) as TabFilter[]
const DEFAULT_REQUEST_FORM_ID = '859'

export default function CreditDashboard() {
  const router = useRouter()
  const session = useClientDataStore((state) => state)
  const requests = useClientRequestStore((state) => state.requests)
  const [isCreatingRequest, setIsCreatingRequest] = useState(false)
  const [createRequestError, setCreateRequestError] = useState('')

  const user = useMemo(() => {
    const data = session.client?.pii
    return { name: `${data?.name} ${data?.apellido_paterno}`, email: data?.email }
  }, [session])

  const [activeTab, setActiveTab] = useState<TabFilter>('all')
  const [detailModal, setDetailModal] = useState<{ open: boolean; credit: ClientRequestRecord | null }>({ open: false, credit: null })

  const filteredCredits = requests.filter((r) =>
    activeTab === 'all' ? true : r.data.estado === activeTab
  )

  const handleOpenDetail = (record: ClientRequestRecord) =>
    setDetailModal({ open: true, credit: record })

  const handleCloseDetail = () =>
    setDetailModal({ open: false, credit: null })

  const handleCreateNewRequest = async () => {
    if (isCreatingRequest) return

    const clientId = Number(session.client?.id ?? 0)
    if (!clientId) {
      setCreateRequestError('No se pudo identificar el cliente para crear una nueva solicitud.')
      return
    }

    setCreateRequestError('')
    setIsCreatingRequest(true)

    try {
      const currentFormId = requests[0]?.form_id
      const formId = String(currentFormId ?? DEFAULT_REQUEST_FORM_ID)
      const createdRequest = await addRequest({
        form_id: formId,
        client: clientId,
        enabled: 1,
        data: {
          paso_actual: ROUTES.ONBOARDING.FINANCIAL_DATA,
        },
      })

      if (!createdRequest?.id) {
        throw new Error('No se pudo crear la nueva solicitud.')
      }

      useClientRequestStore.getState().upsertRequest(createdRequest, true)
      router.push(ROUTES.ONBOARDING.FINANCIAL_DATA)
    } catch (error) {
      setCreateRequestError(
        error instanceof Error
          ? error.message
          : 'No se pudo crear la nueva solicitud. Intenta nuevamente.',
      )
    } finally {
      setIsCreatingRequest(false)
    }
  }

  const handleDetailContinue = () => {
    if (!detailModal.credit) return
    const id = detailModal.credit.id
    handleCloseDetail()
    router.push(`${ROUTES.ONBOARDING.CURP_VERIFICATION}?requestId=${id}`)
  }

  return (
    <>
      {/* Credit Detail Modal */}
      {detailModal.open && detailModal.credit && (
        <CreditDetailModal
          credit={detailModal.credit}
          onClose={handleCloseDetail}
          onPay={handleDetailContinue}
        />
      )}

      {/* Welcome + New Request */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <TitleCard>
            ¡Bienvenido {user.name}!
          </TitleCard>

          <SubtitleCard>
            Consulta el estado de tus solicitudes de crédito, revisa los detalles  <br /> y continúa con los trámites pendientes.
          </SubtitleCard>
        </div>

        <ButtonCard
          onClick={handleCreateNewRequest}
          disabled={isCreatingRequest}
          loading={isCreatingRequest}
          loadingText="Creando solicitud..."
          className="w-auto px-4 py-2"
        >
          <Plus />
          Nueva solicitud de crédito
        </ButtonCard>
      </div>
      {createRequestError && (
        <p className="mb-4 text-sm text-destructive">{createRequestError}</p>
      )}

      {filteredCredits.length === 0 && activeTab === 'all' ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
              <path d="M9 12h6" /><path d="M12 9v6" /><circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <p className="text-base font-semibold text-foreground mb-1">Sin créditos activos</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Aún no tienes ningún crédito. Solicita uno ahora y recibe tu dinero en minutos.
          </p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeTab === tab
                  ? 'bg-brand-dark text-background'
                  : 'bg-transparent text-foreground border border-border hover:bg-secondary'
                  }`}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>

          {/* Credit list */}
          <div className="flex flex-col gap-4">
            {filteredCredits.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No hay créditos en esta categoría.
              </p>
            ) : (
              filteredCredits.map((record) => (
                <ClientRequestItem
                  key={record.id}
                  request={record}
                  handleOpenDetail={handleOpenDetail}
                />
              ))
            )}
          </div>
        </>
      )}
    </>
  )
}
