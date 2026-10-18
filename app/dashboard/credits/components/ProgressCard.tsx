import { safeMoney } from "../utils";

interface ProgressCardProps {
  progressPct: number;
  hasSummary: boolean;
  paidAmount: number;
  pendingAmount?: number | null;
  completedPayments: number;
  totalPayments: number;
}

export default function ProgressCard({
  progressPct,
  hasSummary,
  paidAmount,
  pendingAmount,
  completedPayments,
  totalPayments,
}: ProgressCardProps) {
  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6 xl:col-span-2">
      <div>
        <h2 className="text-base font-semibold text-foreground">Progreso del crédito</h2>
        <p className="mt-1 text-sm text-muted-foreground">Avance de tus pagos programados</p>
      </div>

      <p className="mt-6 text-2xl font-semibold text-brand-accent">{progressPct}%</p>
      <div
        role="progressbar"
        aria-label="Progreso del crédito"
        aria-valuenow={progressPct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="mt-4 h-2 overflow-hidden rounded-full bg-secondary"
      >
        <div
          className="h-full rounded-full bg-brand-accent transition-[width]"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Pagado</p>
          <p className="mt-1 font-semibold text-foreground">
            {hasSummary ? safeMoney(paidAmount) : "—"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Por pagar</p>
          <p className="mt-1 font-semibold text-foreground">
            {safeMoney(pendingAmount)}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-4">
        <p className="text-sm text-muted-foreground">Pagos completados</p>
        <p className="text-right text-sm font-semibold text-foreground">
          {completedPayments} de {totalPayments} pagos
        </p>
      </div>
    </article>
  );
}
