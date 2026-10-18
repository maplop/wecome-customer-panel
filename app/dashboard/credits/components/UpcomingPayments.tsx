"use client";

import { useState } from "react";
import { CalendarDays, ChevronDown } from "@/lib/icons";
import { formatMoney } from "@/utils/formatters";
import type { CreditInstallment } from "@/types/credit-account";
import { formatShortDate } from "../utils";

const INITIAL_ITEMS = 5;

interface UpcomingPaymentsProps {
  installments: CreditInstallment[];
}

export default function UpcomingPayments({ installments }: UpcomingPaymentsProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? installments : installments.slice(0, INITIAL_ITEMS);

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">Próximos pagos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Plazos pendientes de tu crédito
        </p>
      </div>

      {installments.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">
          No tienes pagos pendientes.
        </p>
      ) : (
        <>
          <ul className="mt-5 flex flex-col divide-y divide-border rounded-xl border border-border">
            {visible.map((installment, index) => (
              <li
                key={`upcoming-${installment.term}`}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <span className="flex items-center gap-2 text-foreground">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-accent/10 text-xs font-semibold text-brand-accent">
                    {installment.term}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    {formatShortDate(installment.dueDate)}
                  </span>
                  {index === 0 && (
                    <span className="rounded-full bg-brand-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-accent">
                      Próximo
                    </span>
                  )}
                </span>
                <span className="font-semibold text-foreground">
                  {formatMoney(installment.amount)}
                </span>
              </li>
            ))}
          </ul>

          {installments.length > INITIAL_ITEMS && (
            <div className="mt-4 flex justify-center border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setShowAll((current) => !current)}
                aria-expanded={showAll}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-brand-dark transition hover:bg-secondary"
              >
                {showAll ? "Ver menos" : `Ver los ${installments.length} pagos`}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showAll ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
