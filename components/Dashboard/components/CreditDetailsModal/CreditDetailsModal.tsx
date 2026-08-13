'use client'

import { useState } from 'react'
import { X, CheckCircle, Check, CalendarClock, CalendarDays, TrendingUp, ShieldCheck, Tag, AlertCircle, CheckCircle2 } from '@/lib/icons'
import type { ClientRequestRecord } from '@/types/client-request'
import { Row, TotalRow, SectionTitle, FactCard } from '@/components/common/CreditDetails'
import { LoadingState } from '@/components/common/LoadingState'
import { SuccessView } from './SuccessView'
import { useCreditDetails } from './useCreditDetails'

interface CreditDetailsModalProps {
  credit: ClientRequestRecord
  onClose: () => void
}

function formatMoney(n: number) {
  return `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
}

export default function CreditDetailsModal({ credit, onClose }: CreditDetailsModalProps) {
  const [confirmReject, setConfirmReject] = useState(false)
  const {
    showSuccess,
    isUpdating,
    isRejecting,
    error,
    tab,
    setTab,
    amortizacion,
    isLoading,
    creditData,
    fetchError,
    montoOfertado,
    frecuenciaDePago,
    plazo,
    TipoIcon,
    handleAccept,
    handleReject,
  } = useCreditDetails(credit)

  const canAcceptOffer = credit.data.estado === 'resolved'
  const isCompleted = credit.data.estado === 'completed'
  const isActive = credit.data.estado === 'active'

  const handleRejectClick = async () => {
    const rejected = await handleReject()
    if (rejected) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-background rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-y-auto">

        {!showSuccess ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-background">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-accent/10">
                  <CheckCircle className="h-5 w-5 text-brand-accent" />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">
                    {isCompleted
                      ? '¡Tu crédito fue completado!'
                      : isActive
                        ? '¡Tu crédito está activo!'
                        : '¡Tu crédito fue aprobado!'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isCompleted ? 'Crédito finalizado' : isActive ? 'Crédito en curso' : 'Oferta disponible'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary transition"
              >
                <X />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-6 flex flex-col gap-5">
              <div className="rounded-2xl p-6 flex flex-col items-center gap-3 text-center bg-brand-dark">
                <div className="flex justify-center items-center w-10 h-10 rounded-full bg-brand-accent">
                  <Check className="stroke-brand-dark w-8 h-8" />
                </div>
                <span className="text-xs font-medium text-white/60 uppercase tracking-widest">
                  Monto aprobado
                </span>
                <span className="text-4xl font-bold text-white">
                  {formatMoney(montoOfertado)}
                </span>
                <span className="text-sm text-white/50">MXN</span>
              </div>

              {/* Estado de carga */}
              {isLoading && (
                <LoadingState label='Obteniendo la información de tu crédito...' />
              )}

              {/* Estado de error */}
              {fetchError && (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    {fetchError}
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-2 px-4 py-2 text-sm font-medium text-white bg-brand-accent rounded-lg hover:bg-brand-accent/90 transition"
                  >
                    Cerrar
                  </button>
                </div>
              )}

              {/* Contenido normal */}
              {!isLoading && !fetchError && creditData && (
                <>
                  {/* Tabs */}
                  <div className="flex rounded-xl bg-secondary p-1">
                    {(['detalles', 'amortizacion'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTab(t)}
                        className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${tab === t
                          ? 'bg-brand-dark text-white shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                          }`}
                      >
                        {t === 'detalles' ? 'Detalles' : 'Amortización'}
                      </button>
                    ))}
                  </div>

                  {tab === 'detalles' && (
                    <div className="flex flex-col gap-4">
                      <section className="grid grid-cols-3 gap-3">
                        <FactCard
                          label="Frecuencia"
                          value={frecuenciaDePago}
                          icon={<CalendarClock className="h-4 w-4" />}
                        />
                        <FactCard
                          label="Plazo"
                          value={plazo ? `${plazo} meses` : '-'}
                          icon={<CalendarDays className="h-4 w-4" />}
                        />
                        <FactCard
                          label="Tipo"
                          value={creditData.tipo}
                          icon={<TipoIcon className="h-4 w-4" />}
                        />
                      </section>

                      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div className="mb-1">
                          <SectionTitle>
                            ¿Qué pagas {frecuenciaDePago.toLowerCase()}?
                          </SectionTitle>
                        </div>

                        <div className="divide-y divide-border">
                          <Row
                            label="Pago base (capital + intereses)"
                            value={creditData.pagoPeriodico.pagoBase}
                            icon={<TrendingUp className="h-4 w-4" />}
                          />

                          {creditData.mostrarSeguros && (
                            <>
                              <Row
                                label="Seguro de vida"
                                value={creditData.pagoPeriodico.seguroVida}
                                operator="+"
                              />
                              <Row
                                label="Seguro de invalidez"
                                value={creditData.pagoPeriodico.seguroInvalidez}
                                operator="+"
                              />
                            </>
                          )}

                          {creditData.mostrarSubtotal && (
                            <Row
                              label="Subtotal"
                              value={creditData.pagoPeriodico.subtotal}
                              operator="="
                              tone="muted"
                            />
                          )}

                          {creditData.mostrarIva && (
                            <Row
                              label="IVA (16%)"
                              value={creditData.pagoPeriodico.iva}
                              operator="+"
                            />
                          )}
                        </div>

                        <div className="mt-4">
                          <TotalRow
                            label={`Total ${frecuenciaDePago.toLowerCase()}`}
                            value={creditData.pagoPeriodico.total}
                            hint={`Lo que pagas ${frecuenciaDePago.toLowerCase()}`}
                          />
                        </div>
                      </section>

                      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div className="mb-1">
                          <SectionTitle>¿Cuánto pagarás en total?</SectionTitle>
                        </div>

                        <div className="divide-y divide-border">
                          <Row
                            label="Total capital + intereses"
                            value={creditData.totales.capitalIntereses}
                            icon={<TrendingUp className="h-4 w-4" />}
                          />

                          {creditData.mostrarSeguros && (
                            <Row
                              label="Total seguros"
                              value={creditData.totales.seguros}
                              icon={<ShieldCheck className="h-4 w-4" />}
                            />
                          )}

                          {creditData.mostrarIva && (
                            <Row
                              label="Total IVA"
                              value={creditData.totales.iva}
                              operator="+"
                            />
                          )}
                        </div>

                        <div className="mt-4">
                          <TotalRow
                            label="Total a pagar"
                            value={creditData.totales.total}
                            hint={creditData.mostrarSeguros
                              ? 'Suma de capital + intereses + seguros + IVA'
                              : 'Suma de capital + intereses (sin seguros ni IVA)'
                            }
                          />
                        </div>
                      </section>

                      <section className="rounded-2xl border border-dashed border-border bg-muted/40 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-2.5">
                            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card text-primary">
                              <Tag className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground">Comisión por apertura</p>
                              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                                Se descuenta una sola vez al inicio. No se suma a tu pago semanal ni al total.
                              </p>
                            </div>
                          </div>
                          <span className="shrink-0 text-lg font-semibold tabular-nums text-foreground">
                            {formatMoney(creditData.totales.comisionApertura)}
                          </span>
                        </div>
                      </section>
                    </div>
                  )}

                  {tab === 'amortizacion' && (
                    <div className="rounded-2xl border border-border bg-secondary/40 p-4 flex flex-col gap-3">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Tabla de amortización
                      </p>

                      {!isLoading && amortizacion.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No hay datos de amortización disponibles.
                        </p>
                      )}

                      {amortizacion.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-border text-muted-foreground">
                                <th className="text-left py-2 pr-2 font-medium">Período</th>
                                <th className="text-right py-2 px-2 font-medium">Pago</th>
                                <th className="text-right py-2 px-2 font-medium">Interés</th>
                                <th className="text-right py-2 px-2 font-medium">Capital</th>
                                <th className="text-right py-2 pl-2 font-medium">Saldo</th>
                              </tr>
                            </thead>
                            <tbody>
                              {amortizacion.map((row) => (
                                <tr key={row.periodo} className="border-b border-border/50">
                                  <td className="py-2 pr-2 text-foreground">{row.periodo}</td>
                                  <td className="py-2 px-2 text-right text-foreground">
                                    {formatMoney(row.pago)}
                                  </td>
                                  <td className="py-2 px-2 text-right text-foreground">
                                    {formatMoney(row.interes)}
                                  </td>
                                  <td className="py-2 px-2 text-right text-foreground">
                                    {formatMoney(row.capital)}
                                  </td>
                                  <td className="py-2 pl-2 text-right text-foreground">
                                    {formatMoney(row.saldo)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border flex flex-col gap-3">
              {error && <p className="text-xs text-destructive text-center">{error}</p>}
              {!canAcceptOffer ? (
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading || !!fetchError}
                  className="w-full px-4 py-2.5 rounded-lg border border-border text-foreground hover:bg-secondary transition font-medium text-sm disabled:opacity-50"
                >
                  Cerrar
                </button>
              ) : confirmReject ? (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-center text-muted-foreground">
                    ¿Seguro que deseas rechazar la oferta? Esta acción no se puede deshacer.
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setConfirmReject(false)}
                      disabled={isRejecting || isUpdating}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground hover:bg-secondary transition font-medium text-sm disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleRejectClick}
                      disabled={isRejecting || isUpdating || isLoading || !!fetchError}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-brand-dark text-white hover:bg-brand-dark/90 transition font-medium text-sm disabled:opacity-50"
                    >
                      {isRejecting ? 'Rechazando...' : 'Sí, rechazar'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setConfirmReject(true)}
                      disabled={isUpdating || isLoading || !!fetchError || !creditData}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-brand-dark text-white hover:bg-brand-dark/90 transition font-medium text-sm disabled:opacity-50"
                    >
                      Rechazar oferta
                    </button>
                    <button
                      type="button"
                      onClick={handleAccept}
                      disabled={isUpdating || isLoading || !!fetchError || !creditData}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-brand-accent text-white hover:bg-brand-accent/90 transition font-medium text-sm disabled:opacity-50"
                    >
                      {isUpdating ? 'Aceptando...' : 'Aceptar oferta'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isUpdating || isLoading || !!fetchError}
                    className="w-full px-4 py-2.5 rounded-lg border border-border text-foreground hover:bg-secondary transition font-medium text-sm disabled:opacity-50"
                  >
                    Revisar después
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <SuccessView amount={formatMoney(montoOfertado)} onClose={onClose} />
        )}

      </div>
    </div>
  )
}
