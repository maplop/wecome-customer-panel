import { CreditCard } from '@/lib/icons'
import type { ClientRequestRecord } from "@/types/client-request"
import { ESTADO_CONFIG } from "../constants/request-status"
import { formatMoney, formatPaymentFrequency } from '@/utils/formatters'
import { getCreditTypeLabel } from '@/utils/credit-type'

export interface ClientRequestItemProps {
  request: ClientRequestRecord
  handleOpenDetail?: (request: ClientRequestRecord) => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export default function ClientRequestItem({
  request,
  handleOpenDetail,
}: ClientRequestItemProps) {
  const data = request.data
  const estado = data.estado ?? "pending"
  const estadoCfg = ESTADO_CONFIG[estado]

  const solicitado = Number(data.monto_solicitado ?? 0)
  const frecuenciaDePago = formatPaymentFrequency(data.frecuencia_de_pago_solicitada)

  return (
    <div className="rounded-2xl border border-border bg-card px-5 pt-3 pb-5 flex flex-col gap-3">

      {/* Fecha arriba izquierda */}
      <div className="flex justify-end">
        <span className="text-xs text-muted-foreground">
          {formatDate(request.created_at)}
        </span>
      </div>

      {/* Columnas */}
      <div className="grid grid-cols-[minmax(180px,1.8fr)_minmax(100px,1fr)_minmax(80px,0.7fr)_minmax(110px,0.9fr)_minmax(70px,0.6fr)_minmax(90px,0.8fr)_auto] items-center gap-x-6 gap-y-0">

        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary shrink-0">
            <CreditCard className="h-5 w-5 text-foreground" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-base font-semibold text-foreground">
              Crédito Nómina
            </span>
            <span className="text-xs text-muted-foreground font-mono truncate">
              {request.id}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-xs text-muted-foreground">Solicitado</span>
          <span className="text-base font-bold text-brand-accent truncate">
            {formatMoney(solicitado)}
          </span>
        </div>

        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-xs text-muted-foreground">Tipo</span>
          <span className="text-sm font-medium text-foreground truncate">
            {getCreditTypeLabel(data.tipo_de_credito_solicitado) ?? '-'}
          </span>
        </div>

        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-xs text-muted-foreground">Frecuencia</span>
          <span className="text-sm font-semibold text-foreground truncate">
            {frecuenciaDePago}
          </span>
        </div>

        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-xs text-muted-foreground">Plazo</span>
          <span className="text-sm font-medium text-foreground truncate">
            {data.plazo_solicitado ? `${data.plazo_solicitado} meses` : '-'}
          </span>
        </div>

        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-xs text-muted-foreground">Estado</span>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium w-fit ${estadoCfg.className}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${estadoCfg.dot}`} />
            {estadoCfg.label}
          </span>
        </div>

        <div className="flex justify-end items-center">
          {estado !== "pending" && (
            <button
              type="button"
              onClick={() => handleOpenDetail?.(request)}
              className="rounded-lg bg-brand-dark px-2 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 active:scale-[0.98] whitespace-nowrap"
            >
              Detalles
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
