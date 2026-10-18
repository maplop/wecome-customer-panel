import { formatMoney } from "@/utils/formatters";
import type { CreditInstallment } from "@/types/credit-account";
import { formatShortDate, safeMoney } from "../utils";

interface LatePaymentsCardProps {
  overdueAmount: number;
  lateTerms: number;
  installments: CreditInstallment[];
}

function InfoStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  tone?: "default" | "warning" | "success" | "danger";
}) {
  const toneClass =
    tone === "warning"
      ? "text-amber-600 dark:text-amber-400"
      : tone === "success"
        ? "text-emerald-600 dark:text-emerald-400"
        : tone === "danger"
          ? "text-red-600 dark:text-red-400"
          : "text-foreground";
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-base font-semibold ${toneClass}`}>{value}</span>
    </div>
  );
}

export default function LatePaymentsCard({
  overdueAmount,
  lateTerms,
  installments,
}: LatePaymentsCardProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-foreground">Mora y atrasos</h2>
        <p className="text-sm text-muted-foreground">
          {installments.length > 0
            ? "Tienes plazos vencidos; regularízalos para evitar cargos adicionales."
            : "No tienes plazos vencidos. ¡Vas al corriente!"}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <InfoStat
          label="Monto vencido"
          value={safeMoney(overdueAmount)}
          tone={overdueAmount > 0 ? "danger" : "success"}
        />
        <InfoStat
          label="Plazos con atraso"
          value={lateTerms}
          tone={lateTerms > 0 ? "danger" : "success"}
        />
        <InfoStat
          label="Próximo vencimiento"
          value={formatShortDate(installments[0]?.dueDate)}
        />
        <InfoStat
          label="Días de atraso máx."
          value={
            installments.length > 0
              ? Math.max(...installments.map((i) => i.late ?? 0))
              : 0
          }
          tone={
            installments.some((i) => (i.late ?? 0) > 0) ? "warning" : "success"
          }
        />
      </div>

      {installments.length > 0 && (
        <ul className="mt-5 flex flex-col divide-y divide-border rounded-xl border border-border">
          {installments.map((installment) => (
            <li
              key={`overdue-${installment.term}`}
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <span className="flex items-center gap-2 text-foreground">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-xs font-semibold text-red-600 dark:text-red-400">
                  {installment.term}
                </span>
                {formatShortDate(installment.dueDate)}
              </span>
              <span className="flex items-center gap-4">
                {installment.late > 0 && (
                  <span className="text-xs text-amber-600 dark:text-amber-400">
                    {installment.late} días
                  </span>
                )}
                <span className="font-semibold text-foreground">
                  {formatMoney(installment.amount)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
