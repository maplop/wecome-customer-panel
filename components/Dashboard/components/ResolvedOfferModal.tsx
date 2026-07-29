'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, CheckCircle, Check, CircleDollarSign, Calendar, HandCoins, ShieldCheck } from '@/lib/icons'
import type { ClientRequestRecord, AmortizacionRow } from '@/types/client-request'
import { getCreditTypeLabel } from '@/utils/credit-type'
import { formatPaymentFrequency } from '@/utils/formatters'
import { InfoCard } from '@/components/common/InfoCard'
import { updateActiveRequestData } from '@/services/client-requests'
import { calculateScore } from '@/services/onboarding/evaluate-score'
import { useClientDataStore, useClientProfileStore } from '@/stores'
import { apiClient } from '@/api/dynamicore/frontend'
import confetti from 'canvas-confetti'

interface ResolvedOfferModalProps {
  credit: ClientRequestRecord
  onClose: () => void
}

function formatMoney(n: number) {
  return `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
}

const CONFETTI_Z_INDEX = 9999

export default function ResolvedOfferModal({ credit, onClose }: ResolvedOfferModalProps) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'detalles' | 'amortizacion'>('detalles')
  const [amortizacion, setAmortizacion] = useState<AmortizacionRow[]>([])
  const [loadingAmortizacion, setLoadingAmortizacion] = useState(false)
  const [amortError, setAmortError] = useState('')

  const data = credit.data
  const montoOfertado = Number(data.monto_ofertado)
  const montoSolicitado = Number(data.monto_solicitado)
  const frecuenciaDePago = formatPaymentFrequency(data.frecuencia_de_pago_ofertada)
  const tipoDeCredito = getCreditTypeLabel(data.tipo_de_credito_ofertado) ?? '-'
  const plazo = data.plazo_ofertado
  const ofertado = formatMoney(montoOfertado)
  const solicitado = formatMoney(montoSolicitado)
  const isProtected = data.tipo_de_credito_ofertado === 'protected'
  const evaluationId = data.evaluation_id ?? ''

  const paymentAmount = (() => {
    const v = isProtected ? data.pago_por_periodo_con_seguros_iva : data.pago_por_periodo_sin_seguros
    return v ? Number(v) : 0
  })()
  const totalToPay = Number(data.monto_total_a_pagar) || 0
  const monthlyRate = Number(data.tasa_mensual_sin_iva) || 0
  const commission = Number(data.comision_apertura) || 0

  const fetchAmortizacion = useCallback(async () => {
    if (!evaluationId || amortizacion.length > 0) return

    setLoadingAmortizacion(true)
    setAmortError('')
    try {
      const result = await calculateScore({
        action: 'calculate',
        evaluation_id: evaluationId,
        monto_solicitado: montoOfertado,
      })
      if (result?.tabla_amortizacion) {
        setAmortizacion(result.tabla_amortizacion)
      }
    } catch {
      setAmortError('No se pudo obtener la tabla de amortización.')
    } finally {
      setLoadingAmortizacion(false)
    }
  }, [evaluationId, montoOfertado, amortizacion.length])

  useEffect(() => {
    if (tab === 'amortizacion') {
      fetchAmortizacion()
    }
  }, [tab, fetchAmortizacion])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    if (!showSuccess) return

    const end = Date.now() + 5 * 1000
    const colors = ['#E1941F', '#FFFFFF']

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        zIndex: CONFETTI_Z_INDEX,
        origin: { x: 0 },
        colors,
      })
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        zIndex: CONFETTI_Z_INDEX,
        origin: { x: 1 },
        colors,
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    frame()
  }, [showSuccess])

  const handleAccept = async () => {
    setIsUpdating(true)
    setError('')
    try {
      await updateActiveRequestData({ estado: 'approved' })
      setShowSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la solicitud.')
    } finally {
      setIsUpdating(false)
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
                  <p className="text-base font-semibold text-foreground">¡Tu crédito fue aprobado!</p>
                  <p className="text-xs text-muted-foreground">Oferta disponible</p>
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
                  {ofertado}
                </span>
                <span className="text-sm text-white/50">MXN</span>
              </div>

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
                <div className="rounded-2xl border border-border bg-secondary/40 p-4 flex flex-col gap-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Detalle de la oferta
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <InfoCard
                      icon={CircleDollarSign}
                      label="Monto solicitado"
                      value={solicitado}
                      valueSize="sm"
                    />
                    <InfoCard
                      icon={Calendar}
                      label="Plazo"
                      value={plazo ? `${plazo} meses` : '-'}
                      valueSize="sm"
                    />
                    <InfoCard
                      icon={Calendar}
                      label="Frecuencia"
                      value={frecuenciaDePago}
                      valueSize="sm"
                    />
                    <InfoCard
                      icon={ShieldCheck}
                      label="Tipo"
                      value={tipoDeCredito}
                      valueSize="sm"
                      valueClassName="truncate"
                    />
                    <InfoCard
                      icon={CircleDollarSign}
                      label="Pago por periodo"
                      value={formatMoney(paymentAmount >= 0 ? paymentAmount : 0)}
                    />
                    <InfoCard
                      icon={HandCoins}
                      label="Total a pagar"
                      value={formatMoney(totalToPay)}
                    />
                    <InfoCard
                      icon={CircleDollarSign}
                      label="Tasa mensual"
                      value={`${monthlyRate.toFixed(2)}%`}
                      valueSize="sm"
                    />
                    <InfoCard
                      icon={CircleDollarSign}
                      label="Comisión apertura"
                      value={formatMoney(commission)}
                      valueSize="sm"
                    />
                  </div>
                </div>
              )}

              {tab === 'amortizacion' && (
                <div className="rounded-2xl border border-border bg-secondary/40 p-4 flex flex-col gap-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Tabla de amortización
                  </p>

                  {loadingAmortizacion && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Calculando tabla de amortización...
                    </p>
                  )}

                  {amortError && (
                    <p className="text-xs text-destructive text-center">{amortError}</p>
                  )}

                  {!loadingAmortizacion && !amortError && amortizacion.length === 0 && (
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

              <div className="flex items-start gap-2 p-3 rounded-lg bg-brand-accent/5">
                <div className="flex h-5 w-5 items-center justify-center rounded-full shrink-0 bg-brand-accent/20 text-brand-accent text-xs font-bold">i</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Al aceptar esta oferta, autorizas el desembolso del crédito en tu cuenta registrada. Tendrás 30 días para cambiar de opinión sin penalidad.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border flex flex-col gap-3">
              {error && <p className="text-xs text-destructive text-center">{error}</p>}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground hover:bg-secondary transition font-medium text-sm disabled:opacity-50"
                >
                  Revisar después
                </button>
                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-brand-dark text-white hover:bg-brand-dark/90 transition font-medium text-sm disabled:opacity-50"
                >
                  {isUpdating ? 'Aceptando...' : 'Aceptar oferta'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Success view */}
            <div className="px-6 py-10 flex flex-col items-center gap-5 text-center">
              <div className="flex justify-center items-center w-16 h-16 rounded-full bg-brand-accent">
                <CheckCircle className="stroke-brand-dark w-12 h-12" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xl font-bold text-foreground">
                  ¡Felicidades!
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Tu crédito ha sido aprobado y el monto de{' '}
                  <strong className="text-foreground">{ofertado} MXN</strong>{' '}
                  será depositado en tu cuenta registrada.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="w-full px-4 py-2.5 rounded-lg bg-brand-dark text-white hover:bg-brand-dark/90 transition font-medium text-sm"
              >
                Ir al panel principal
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
