'use client'
import { CreditCard, X } from '@/lib/icons'
import type { ClientRequestRecord, ClientRequestData } from '@/types/client-request'
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
  const estado = (data.estado ?? 'pending') as NonNullable<ClientRequestData["estado"]>
  const estadoCfg = ESTADO_CONFIG[estado]

  const solicitado = Number(data.monto_solicitado ?? 0)
  const frecuenciaDePago = formatPaymentFrequency(data.frecuencia_de_pago_solicitada)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-background rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
              <CreditCard className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">Crédito Nómina</p>
              <p className="text-xs text-muted-foreground font-mono">{credit.id}</p>
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
        <div className="px-6 py-5 flex flex-col gap-6">

          {/* Monto solicitado */}
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-muted-foreground">Monto solicitado</p>
            <span className="text-2xl font-bold text-brand-accent">{formatMoney(solicitado)}</span>
          </div>

          {/* Campos en grid 2 columnas */}
          <div className="grid grid-cols-2 gap-4">

            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Tipo de crédito</span>
              <span className="text-sm font-medium text-foreground">{getCreditTypeLabel(data.tipo_de_credito_solicitado) ?? '-'}</span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Frecuencia</span>
              <span className="text-sm font-medium text-foreground">{frecuenciaDePago}</span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Plazo</span>
              <span className="text-sm font-medium text-foreground">
                {data.plazo_solicitado ? `${data.plazo_solicitado} meses` : '-'}
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Estado</span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium w-fit ${estadoCfg.className}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${estadoCfg.dot}`} />
                {estadoCfg.label}
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Fecha de creación</span>
              <span className="text-sm font-medium text-foreground">{formatDate(credit.created_at)}</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
