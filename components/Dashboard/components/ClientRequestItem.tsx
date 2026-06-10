import { CreditCard } from '@/lib/icons'
import type { ClientRequestRecord } from "@/types/client-request"
import { ESTADO_CONFIG } from "../constants/request-status"

export interface ClientRequestItemProps {
  request: ClientRequestRecord
  handleOpenDetail?: (request: ClientRequestRecord) => void
}

const MONTO_PAGADO_HARDCODED = 12500

function parseAmount(value?: string): number {
  if (!value) return 0
  const n = Number.parseFloat(value.replace(/[^0-9.,]/g, "").replace(/,/g, ""))
  return Number.isFinite(n) ? n : 0
}

function formatMoney(value: number): string {
  return `${value.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
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
  const isFinished = estado === "completed" || estado === "approved"

  const solicitado = parseAmount(data.monto_solicitado)
  const pagado = MONTO_PAGADO_HARDCODED
  const progress = solicitado > 0 ? Math.min(100, Math.round((pagado / solicitado) * 100)) : 0

  return (
    <div className="rounded-2xl border border-border bg-card px-5 pt-3 pb-5 flex flex-col gap-3">

      {/* Fecha arriba izquierda */}
      <div className="flex justify-end">
        <span className="text-xs text-muted-foreground">
          {formatDate(request.created_at)}
        </span>
      </div>

      {/* Columnas */}
      <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-x-8 gap-y-0">

        {/* Col 1 — ícono + nombre + id */}
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

        {/* Col 2 — pagado / total + barra */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold text-brand-accent">
              {formatMoney(pagado)}
            </span>
            <span className="text-sm text-muted-foreground">
              / {formatMoney(solicitado)}
            </span>
            <span className="ml-auto text-sm font-semibold text-foreground">
              {progress}%
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progress}%`,
                backgroundColor: isFinished ? "var(--brand-dark)" : "var(--brand-accent)",
              }}
            />
          </div>
        </div>

        {/* Col 3 — tipo de crédito */}
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">Tipo</span>
          <span className="text-sm font-medium text-foreground truncate">
            {data.tipo_de_credito ?? "—"}
          </span>
        </div>

        {/* Col 4 — plazo */}
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">Plazo</span>
          <span className="text-sm font-medium text-foreground">
            {data.plazo ? `${data.plazo} meses` : "—"}
          </span>
        </div>

        {/* Col 5 — estado */}
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">Estado</span>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium w-fit ${estadoCfg.className}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${estadoCfg.dot}`} />
            {estadoCfg.label}
          </span>
        </div>

        {/* Col 6 — botones */}
        <div className="flex justify-end items-center">
          <button
            type="button"
            onClick={() => handleOpenDetail?.(request)}
            className="rounded-lg bg-brand-dark px-2 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 active:scale-[0.98]"
          >
            Detalles
          </button>

        </div>

      </div>
    </div>
  )
}
