'use client'
import { CreditCard, X } from '@/lib/icons'
import { ButtonCard } from '@/components/common'
import type { ClientRequestRecord, ClientRequestData } from '@/types/client-request'

const ESTADO_CONFIG: Record<
  NonNullable<ClientRequestData["estado"]>,
  { label: string; className: string; dot: string }
> = {
  pending: {
    label: "Pendiente",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  resolved: {
    label: "Resuelto",
    className: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    dot: "bg-sky-500",
  },
  approved: {
    label: "Aprobado",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  active: {
    label: "Activo",
    className: "bg-brand-accent/10 text-brand-accent",
    dot: "bg-brand-accent",
  },
  completed: {
    label: "Completado",
    className: "bg-brand-dark/10 text-brand-dark",
    dot: "bg-brand-dark",
  },
};
const MONTO_PAGADO_HARDCODED = 12500

function parseAmount(value?: string): number {
  if (!value) return 0
  const n = parseFloat(value.replace(/[^0-9.,]/g, '').replace(/,/g, ''))
  return isFinite(n) ? n : 0
}
function formatMoney(n: number) {
  return `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface CreditDetailModalProps {
  credit: ClientRequestRecord
  onClose: () => void
  onPay: () => void
}

export default function CreditDetailModal({ credit, onClose, onPay }: CreditDetailModalProps) {
  const data = credit.data
  const estado = data.estado ?? 'pending'
  const estadoCfg = ESTADO_CONFIG[estado]
  const isFinished = estado === 'completed' || estado === 'approved'

  const solicitado = parseAmount(data.monto_solicitado)
  const pagado = MONTO_PAGADO_HARDCODED
  const progress = solicitado > 0 ? Math.min(100, Math.round((pagado / solicitado) * 100)) : 0

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

          {/* Monto pagado / solicitado + barra */}
          <div className="flex flex-col gap-2">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Monto pagado</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-brand-accent">{formatMoney(pagado)}</span>
                  <span className="text-sm text-muted-foreground">/ {formatMoney(solicitado)}</span>
                </div>
              </div>
              <span className="text-lg font-semibold text-foreground">{progress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progress}%`,
                  backgroundColor: isFinished ? 'var(--brand-dark)' : 'var(--brand-accent)',
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">Pagado del monto solicitado</p>
          </div>

          {/* Campos en grid 2 columnas */}
          <div className="grid grid-cols-2 gap-4">

            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Tipo de crédito</span>
              <span className="text-sm font-medium text-foreground">{data.tipo_de_credito ?? '—'}</span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Plazo</span>
              <span className="text-sm font-medium text-foreground">
                {data.plazo ? `${data.plazo} meses` : '—'}
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

        {/* Footer */}
        {!isFinished && (
          <div className="px-6 py-4 border-t border-border">
            <ButtonCard
              onClick={onPay}
              className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] bg-brand-accent"
            >
              Continuar solicitud
            </ButtonCard>
          </div>
        )}

      </div>
    </div>
  )
}
