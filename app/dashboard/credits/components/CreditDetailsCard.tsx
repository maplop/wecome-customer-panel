import type { EstadoConfigItem } from "@/components/Dashboard/constants/request-status";
import { Shield, ShieldCheck } from "@/lib/icons";
import { getCreditTypeLabel, isProtectedCredit } from "@/utils/credit-type";

interface CreditDetailsCardProps {
  creditType: string;
  plazo?: number | null;
  periodicidad: string;
  status?: EstadoConfigItem;
}

export default function CreditDetailsCard({
  creditType,
  plazo,
  periodicidad,
  status,
}: CreditDetailsCardProps) {
  const CreditTypeIcon = isProtectedCredit(creditType) ? ShieldCheck : Shield;

  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">Detalles del crédito</h2>
        <p className="mt-1 text-sm text-muted-foreground">Condiciones contratadas</p>
      </div>

      <dl className="mt-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-sm text-muted-foreground">Tipo de crédito</dt>
          <dd className="flex items-center gap-2 text-right text-sm font-semibold text-foreground">
            <CreditTypeIcon className="h-5 w-5 shrink-0 text-brand-accent" aria-hidden="true" />
            {getCreditTypeLabel(creditType) || "—"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-sm text-muted-foreground">Plazo</dt>
          <dd className="text-right text-sm font-semibold text-foreground">
            {plazo ? `${plazo} meses` : "—"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-sm text-muted-foreground">Periodicidad</dt>
          <dd className="text-right text-sm font-semibold text-foreground">{periodicidad}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-sm text-muted-foreground">Estatus</dt>
          <dd>
            {status ? (
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            ) : (
              "—"
            )}
          </dd>
        </div>
      </dl>
    </article>
  );
}
