import { AlertTriangle, Check, Receipt } from "@/lib/icons";
import { safeMoney } from "../utils";

interface SummaryItem {
  terms: number;
  amount?: number | null;
}

interface PaymentSummaryCardProps {
  overdue: SummaryItem;
  pending: SummaryItem;
  settled: SummaryItem;
}

function SummaryStat({
  label,
  terms,
  amount,
  icon,
  iconClassName,
}: SummaryItem & {
  label: string;
  icon: React.ReactNode;
  iconClassName: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold text-foreground">{terms}</p>
        <p className="text-xs text-muted-foreground">{safeMoney(amount)}</p>
      </div>
    </div>
  );
}

export default function PaymentSummaryCard({
  overdue,
  pending,
  settled,
}: PaymentSummaryCardProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">Resumen de pagos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Estado de tus plazos según el producto contratado
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryStat
          label="Vencidos"
          terms={overdue.terms}
          amount={overdue.amount}
          iconClassName="bg-red-500/10 text-red-600 dark:text-red-400"
          icon={<AlertTriangle className="h-5 w-5" aria-hidden="true" />}
        />
        <SummaryStat
          label="Pendientes"
          terms={pending.terms}
          amount={pending.amount}
          iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          icon={<Receipt className="h-5 w-5" aria-hidden="true" />}
        />
        <SummaryStat
          label="Pagados"
          terms={settled.terms}
          amount={settled.amount}
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          icon={<Check className="h-5 w-5" aria-hidden="true" />}
        />
      </div>
    </section>
  );
}
