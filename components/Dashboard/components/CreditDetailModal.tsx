'use client'
import { X, CheckCircle } from '@/lib/icons'
import type { ClientRequestRecord } from '@/types/client-request'
import { ESTADO_CONFIG } from '../constants/request-status'
import { formatMoney, formatPaymentFrequency } from '@/utils/formatters'
import { getCreditTypeLabel } from '@/utils/credit-type'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface CreditDetailModalProps {
  credit: ClientRequestRecord
  onClose: () => void
  onPay: () => void
}

export default function CreditDetailModal({ credit, onClose }: CreditDetailModalProps) {
  const data = credit.data
  const estado = data.estado ?? 'pending'
  const estadoCfg = ESTADO_CONFIG[estado]

  const solicitado = Number(data.monto_solicitado ?? 0)
  const ofertado = Number(data.monto_ofertado ?? 0)
  const frecuenciaDePago = formatPaymentFrequency(data.frecuencia_de_pago_solicitada)
  const tipoDeCredito = getCreditTypeLabel(data.tipo_de_credito_solicitado) ?? '-'
  const plazo = data.plazo_solicitado
  const showOffer = ['approved', 'active', 'completed'].includes(estado)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-background rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-background">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-accent/10">
              <CheckCircle className="h-5 w-5 text-brand-accent" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">Crédito Nómina</p>
              <p className="text-xs text-muted-foreground">{estadoCfg.label}</p>
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

          {/* Hero */}
          <div className="rounded-2xl p-6 flex flex-col items-center gap-3 text-center bg-brand-dark">
            <div className="flex justify-center items-center w-10 h-10 rounded-full bg-brand-accent">
              <CheckCircle className="stroke-brand-dark w-8 h-8" />
            </div>
            <span className="text-xs font-medium text-white/60 uppercase tracking-widest">
              {showOffer ? 'Monto aprobado' : 'Monto solicitado'}
            </span>
            <span className="text-4xl font-bold text-white">
              {showOffer ? formatMoney(ofertado) : formatMoney(solicitado)}
            </span>
            <span className="text-sm text-white/50">MXN</span>
          </div>

          {/* Detalle */}
          <div className="rounded-2xl border border-border bg-secondary/40 p-4 flex flex-col gap-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Detalle del crédito
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Plazo</p>
                <p className="text-sm font-semibold text-foreground">{plazo ? `${plazo} meses` : '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Frecuencia de pago</p>
                <p className="text-sm font-semibold text-foreground">{frecuenciaDePago}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tipo de crédito</p>
                <p className="text-sm font-semibold text-foreground">{tipoDeCredito}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Estado</p>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium w-fit ${estadoCfg.className}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${estadoCfg.dot}`} />
                  {estadoCfg.label}
                </span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fecha de solicitud</p>
                <p className="text-sm font-semibold text-foreground">{formatDate(credit.created_at)}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
