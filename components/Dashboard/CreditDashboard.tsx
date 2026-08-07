'use client'

import { useMemo, useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ButtonCard } from '@/components/common/ButtonCard'
import { TitleCard } from '@/components/common/TitleCard'
import { SubtitleCard } from '@/components/common/SubtitleCard'
import { ClientRequestItem, CreditDetailsModal, DeniedRequestModal } from './components'
import { Plus, RefreshCw, Check, Filter } from '@/lib/icons'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'
import { useClientDataStore } from '@/stores/client-data-store'
import { useClientRequestStore, useCreditDetailsStore } from '@/stores'
import type { RequestStatus, ClientRequestRecord } from '@/types/client-request'
import { addRequest, getRequestsByClient } from '@/services/client-requests'

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
  const [isRefreshingRequests, setIsRefreshingRequests] = useState(false)
  const [createRequestError, setCreateRequestError] = useState('')
  const [refreshRequestsError, setRefreshRequestsError] = useState('')

  const user = useMemo(() => {
    const data = session.client?.pii
    return { name: `${data?.name} ${data?.apellido_paterno}`, email: data?.email }
  }, [session])

  const [activeTab, setActiveTab] = useState<TabFilter>('all')
  const [resolvedOfferModal, setCreditDetailsModal] = useState<{ open: boolean; credit: ClientRequestRecord | null }>({ open: false, credit: null })
  const [deniedRequestModal, setDeniedRequestModal] = useState<{ open: boolean; credit: ClientRequestRecord | null }>({ open: false, credit: null })

  const filteredCredits = requests.filter((r) =>
    activeTab === 'all' ? true : r.data.estado === activeTab
  )

  const handleOpenDetail = (record: ClientRequestRecord) => {
    const estado = record.data.estado ?? 'pending'

    if (estado === 'resolved' || estado === 'approved') {
      setCreditDetailsModal({ open: true, credit: record })
    } else if (estado === 'denied') {
      setDeniedRequestModal({ open: true, credit: record })
    }
  }

  const handleCloseCreditDetailsModal = () =>
    setCreditDetailsModal({ open: false, credit: null })

  const handleCloseDeniedRequestModal = () =>
    setDeniedRequestModal({ open: false, credit: null })

  const handleCreateNewRequest = async () => {
    if (isCreatingRequest) return

    const clientId = Number(session.client?.id ?? 0)
    if (!clientId) {
      setCreateRequestError('No se pudo identificar el cliente para crear una nueva solicitud.')
      return
    }

    setCreateRequestError('')
    setIsCreatingRequest(true)

    const currentStep = ROUTES.ONBOARDING.CREDIT_SELECTION

    try {
      const currentFormId = requests[0]?.form_id
      const formId = String(currentFormId ?? DEFAULT_REQUEST_FORM_ID)
      const createdRequest = await addRequest({
        form_id: formId,
        client: clientId,
        enabled: 1,
        data: {
          paso_actual: currentStep,
        },
      })

      if (!createdRequest?.id) {
        throw new Error('No se pudo crear la nueva solicitud.')
      }

      useClientRequestStore.getState().upsertRequest(createdRequest, true)
      router.push(currentStep)
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

  const handleRefreshRequests = async () => {
    if (isRefreshingRequests) return

    const clientId = Number(session.client?.id ?? 0)
    if (!clientId) {
      setRefreshRequestsError('No se pudo identificar el cliente para actualizar solicitudes.')
      return
    }

    setRefreshRequestsError('')
    setIsRefreshingRequests(true)

    try {
      const latestRequests = await getRequestsByClient(String(clientId))
      useClientRequestStore.getState().syncClientRequests(clientId, latestRequests)
      useCreditDetailsStore.getState().clearCreditDetails()
    } catch (error) {
      setRefreshRequestsError(
        error instanceof Error
          ? error.message
          : 'No se pudieron actualizar las solicitudes. Intenta nuevamente.',
      )
    } finally {
      setIsRefreshingRequests(false)
    }
  }

  const handleRetryDeniedRequest = () => {
    // Mock: en producción aquí se permitiría intentar de nuevo con datos actualizados
    if (!deniedRequestModal.credit) return
    const id = deniedRequestModal.credit.id
    handleCloseDeniedRequestModal()
    // Redirigir a actualizar información
    router.push(`${ROUTES.ONBOARDING.PERSONAL_DATA}?requestId=${id}`)
  }

  return (
    <>
      {/* Resolved Offer Modal */}
      {resolvedOfferModal.open && resolvedOfferModal.credit && (
        <CreditDetailsModal
          credit={resolvedOfferModal.credit}
          onClose={handleCloseCreditDetailsModal}
        />
      )}

      {/* Denied Request Modal */}
      {deniedRequestModal.open && deniedRequestModal.credit && (
        <DeniedRequestModal
          credit={deniedRequestModal.credit}
          onClose={handleCloseDeniedRequestModal}
          onRetry={handleRetryDeniedRequest}
        />
      )}

      <div className="flex flex-1 min-h-0 flex-col">
        {/* Welcome + New Request */}
        <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between md:gap-15">
          <div className="min-w-0 flex-1">
            <TitleCard>
              ¡Bienvenido {user.name}!
            </TitleCard>

            <SubtitleCard>
              Consulte el estado actual de sus solicitudes de crédito y revise la información detallada de cada una.
            </SubtitleCard>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center md:ml-auto">
            <ButtonCard
              variant="secondary"
              onClick={handleRefreshRequests}
              disabled={isRefreshingRequests}
              loading={isRefreshingRequests}
              loadingText="Actualizando..."
              className="w-full sm:w-auto px-4 py-2"
            >
              <RefreshCw size={16} />
              Actualizar solicitudes
            </ButtonCard>

            <ButtonCard
              onClick={handleCreateNewRequest}
              disabled={isCreatingRequest}
              loading={isCreatingRequest}
              loadingText="Creando solicitud..."
              className="w-full sm:w-auto px-4 py-2"
            >
              <Plus />
              Nueva solicitud de crédito
            </ButtonCard>
          </div>
        </div>
        {createRequestError && (
          <p className="mb-4 text-sm text-destructive">{createRequestError}</p>
        )}
        {refreshRequestsError && (
          <p className="mb-4 text-sm text-destructive">{refreshRequestsError}</p>
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
            <div className="mb-6 flex flex-wrap items-center gap-2 md:gap-2">
              <div className="hidden md:flex flex-wrap items-center gap-2">
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

              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    className="md:hidden flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-secondary"
                  >
                    <Filter className="h-4 w-4" />
                    {TAB_LABELS[activeTab]}
                  </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Content
                  align="start"
                  className="w-52 rounded-xl border border-border bg-background shadow-lg z-20 p-1"
                >
                  {TABS.map((tab) => (
                    <DropdownMenu.Item
                      key={tab}
                      onSelect={() => setActiveTab(tab)}
                      className="flex items-center justify-between px-4 py-2 text-sm text-foreground hover:bg-secondary rounded-md cursor-pointer outline-none"
                    >
                      {TAB_LABELS[tab]}
                      {activeTab === tab && <Check className="h-4 w-4 text-brand-accent" />}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>

            {/* Credit list */}
            <div className="grid min-h-0 flex-1 auto-rows-max content-start grid-cols-1 gap-4 overflow-y-auto pb-2 sm:grid-cols-2 lg:grid-cols-1">
              {filteredCredits.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center sm:col-span-2 lg:col-span-1">
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
      </div>
    </>
  )
}

