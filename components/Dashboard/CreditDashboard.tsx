'use client'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ButtonCard } from '@/components/common/ButtonCard'
import { TitleCard } from '@/components/common/TitleCard'
import { SubtitleCard } from '@/components/common/SubtitleCard'
import { ClientRequestItem, CreditDetailsModal, DeniedRequestModal } from './components'
import { Plus, RefreshCw, Check, Filter, Wallet } from '@/lib/icons'
import { useCreditDashboard, TABS, TAB_LABELS } from './useCreditDashboard'

export default function CreditDashboard() {
  const {
    user,
    activeTab,
    setActiveTab,
    filteredCredits,
    canRequestNewCredit,
    isCreatingRequest,
    isRefreshingRequests,
    createRequestError,
    refreshRequestsError,
    creditDetailsModal,
    deniedRequestModal,
    handleOpenDetail,
    handleCloseCreditDetailsModal,
    handleCloseDeniedRequestModal,
    handleCreateNewRequest,
    handleRefreshRequests,
    handleRetryDeniedRequest,
  } = useCreditDashboard()

  return (
    <>
      {/* Resolved Offer Modal */}
      {creditDetailsModal.open && creditDetailsModal.credit && (
        <CreditDetailsModal
          credit={creditDetailsModal.credit}
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

            {canRequestNewCredit && (
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
            )}
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
              <Wallet className="h-9 w-9 text-muted-foreground" />
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
