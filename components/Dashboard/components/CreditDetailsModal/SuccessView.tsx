import { Check, CheckCircle, CheckCircle2 } from '@/lib/icons'
import { formatMoney } from '@/utils/formatters'

interface SuccessViewProps {
  amount: string
  onClose: () => void
}

export function SuccessView({ amount, onClose }: SuccessViewProps) {
  return (
    <>
      <div className="px-6 py-10 flex flex-col items-center gap-5 text-center">
        <div className="rounded-2xl p-6 flex flex-col items-center gap-3 text-center bg-brand-dark w-full">
          <div className="flex justify-center items-center w-10 h-10 rounded-full bg-brand-accent">
            <Check className="stroke-brand-dark w-8 h-8" />
          </div>

          <h2 id="approval-title" className="text-balance  text-white/60  text-2xl font-bold">
            {"¡Crédito aprobado!"}
          </h2>
        </div>

        <p id="approval-desc" className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
          Felicidades, tu solicitud fue aprobada. Este es el monto autorizado para tu crédito.
        </p>

        {/* Monto aprobado */}
        <div className="mt-6 w-full rounded-2xl border border-border bg-muted/40 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monto aprobado</p>
          <p className="mt-1 text-4xl font-bold tabular-nums text-foreground">
            {amount}
          </p>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-border">
        <button
          type="button"
          onClick={onClose}
          className="w-full px-4 py-2.5 rounded-lg bg-brand-accent text-white hover:bg-brand-accent/90 transition font-medium text-sm"
        >
          Ir al panel principal
        </button>
      </div>
    </>
  )
}