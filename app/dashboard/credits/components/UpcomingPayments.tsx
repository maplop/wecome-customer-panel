"use client";

import { useState } from "react";
import { CalendarClock, CalendarDays, ChevronDown } from "@/lib/icons";
import { formatMoney } from "@/utils/formatters";
import type { CreditInstallment } from "@/types/credit-account";
import { formatShortDate } from "../utils";

const INITIAL_VISIBLE_REST = 6;

interface UpcomingPaymentsProps {
  installments: CreditInstallment[];
  totalPayments?: number;
  onPay?: (installment: CreditInstallment) => void;
}

function getDaysRemainingLabel(dueDate?: string | null): string {
  if (!dueDate) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dueDate.trim());
  if (!match) return "";
  const [, y, m, d] = match;
  const due = new Date(Number(y), Number(m) - 1, Number(d));
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays > 1) return `Faltan ${diffDays} días`;
  if (diffDays === 1) return "Falta 1 día";
  if (diffDays === 0) return "Vence hoy";
  return `Vencido hace ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? "día" : "días"}`;
}

export default function UpcomingPayments({
  installments,
  totalPayments,
  onPay,
}: UpcomingPaymentsProps) {
  const [showAll, setShowAll] = useState(false);

  const next = installments[0];
  const rest = installments.slice(1);
  const total = totalPayments || installments.length;
  const termLabel = total ? `· Cuota ${next?.term} de ${total}` : `· Cuota ${next?.term}`;

  const shouldPaginate = rest.length > 8;
  const visibleRest = shouldPaginate && !showAll ? rest.slice(0, INITIAL_VISIBLE_REST) : rest;

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">Próximos pagos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Plazos pendientes de tu crédito
        </p>
      </div>

      {installments.length === 0 || !next ? (
        <p className="text-sm text-muted-foreground">
          No tienes pagos pendientes.
        </p>
      ) : (
        <>
          {/* Tarjeta destacada del próximo pago */}
          <div className="rounded-xl border border-brand-accent/25 bg-brand-accent/[0.04] p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center text-xs font-semibold text-brand-accent">
                Próximo pago {termLabel}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground sm:text-sm sm:font-semibold sm:text-foreground">
                <CalendarDays className="h-4 w-4 text-brand-accent" aria-hidden="true" />
                {formatShortDate(next.dueDate)}
              </span>
            </div>

            <div className="mt-3 flex items-baseline justify-between gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {formatMoney(next.amount)}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-brand-accent/15 pt-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <CalendarClock className="h-4 w-4 text-brand-accent" aria-hidden="true" />
                {getDaysRemainingLabel(next.dueDate)}
              </span>
            </div>
          </div>

          {/* Después: siguientes fechas compactas en chips */}
          {rest.length > 0 && (
            <div className="mt-4 border-t border-border pt-4">
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Después
              </p>

              <div className="flex flex-wrap gap-2">
                {visibleRest.map((installment) => (
                  <span
                    key={`upcoming-${installment.term}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-2.5 py-1 text-xs font-medium text-foreground transition hover:bg-secondary"
                  >
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      #{installment.term}
                    </span>
                    <span>{formatShortDate(installment.dueDate)}</span>
                  </span>
                ))}
              </div>

              {shouldPaginate && (
                <button
                  type="button"
                  onClick={() => setShowAll((current) => !current)}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-dark transition hover:text-brand-accent dark:text-foreground"
                >
                  <span>
                    {showAll
                      ? "Ver menos fechas"
                      : `Ver ${rest.length - INITIAL_VISIBLE_REST} fechas más`}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${showAll ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
