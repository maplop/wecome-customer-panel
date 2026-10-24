"use client";

import { useState } from "react";
import { ChevronDown } from "@/lib/icons";
import { formatMoney } from "@/utils/formatters";
import type { CreditAmortizationRow } from "@/types/credit-account";
import { formatShortDate, installmentStatusMeta } from "../utils";

const INITIAL_ROWS = 6;

interface AmortizationTableProps {
  rows: CreditAmortizationRow[];
}

export default function AmortizationTable({ rows }: AmortizationTableProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleRows = showAll ? rows : rows.slice(0, INITIAL_ROWS);

  const hasInsurance = rows.some((row) => {
    const insurance =
      row.unemploymentInsurance.expected +
      row.unemploymentInsuranceTax.expected +
      row.outstandingBalanceInsurance.expected +
      row.outstandingBalanceInsuranceTax.expected;
    return insurance > 0 || row.totalPayment.expected > row.payment.expected;
  });

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Tabla de amortización</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Consulta el detalle de cada pago y cómo se reduce tu saldo.
          </p>
        </div>
      </header>

      {rows.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">
          No hay datos de amortización disponibles.
        </p>
      ) : (
        <>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[950px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-foreground">
                  <th scope="col" className="px-2 py-3 font-semibold">Período</th>
                  <th scope="col" className="px-2 py-3 font-semibold">Fecha</th>
                  <th scope="col" className="px-2 py-3 text-right font-semibold">Saldo inicial</th>
                  <th scope="col" className="px-2 py-3 text-right font-semibold">Capital</th>
                  <th scope="col" className="px-2 py-3 text-right font-semibold">Interés</th>
                  {hasInsurance && (
                    <th scope="col" className="px-2 py-3 text-right font-semibold">Seguros + IVA</th>
                  )}
                  <th scope="col" className="px-2 py-3 text-right font-semibold">Pago total</th>
                  <th scope="col" className="px-2 py-3 text-right font-semibold">Saldo</th>
                  <th scope="col" className="px-2 py-3 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => {
                  const status = installmentStatusMeta(row);
                  const insurance =
                    row.unemploymentInsurance.expected +
                    row.unemploymentInsuranceTax.expected +
                    row.outstandingBalanceInsurance.expected +
                    row.outstandingBalanceInsuranceTax.expected ||
                    (row.totalPayment.expected > row.payment.expected
                      ? row.totalPayment.expected - row.payment.expected
                      : 0);
                  const total = row.detail?.total || row.totalPayment.expected;

                  return (
                    <tr
                      key={row.term}
                      className="border-b border-border/70 transition-colors hover:bg-secondary/50 last:border-b-0"
                    >
                      <th scope="row" className="px-2 py-3 text-left font-semibold text-foreground">
                        {String(row.term).padStart(2, "0")}
                      </th>
                      <td className="whitespace-nowrap px-2 py-3 text-foreground">{formatShortDate(row.dueDate)}</td>
                      <td className="whitespace-nowrap px-2 py-3 text-right text-foreground">
                        {formatMoney(row.balance)}
                      </td>
                      <td className="whitespace-nowrap px-2 py-3 text-right text-foreground">
                        {formatMoney(row.principal.expected)}
                      </td>
                      <td className="whitespace-nowrap px-2 py-3 text-right text-foreground">
                        {formatMoney(row.interest.expected)}
                      </td>
                      {hasInsurance && (
                        <td className="whitespace-nowrap px-2 py-3 text-right text-foreground">
                          {formatMoney(insurance)}
                        </td>
                      )}
                      <td className="whitespace-nowrap px-2 py-3 text-right font-semibold text-foreground">
                        {formatMoney(total)}
                      </td>
                      <td className="whitespace-nowrap px-2 py-3 text-right text-foreground">
                        {formatMoney(row.finalBalance)}
                      </td>
                      <td className="px-2 py-3">
                        <span
                          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                        >
                          <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-center border-t border-border pt-3">
            <button
              type="button"
              onClick={() => setShowAll((current) => !current)}
              aria-expanded={showAll}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-brand-dark transition hover:bg-secondary"
            >
              {showAll ? "Ver menos pagos" : "Ver todos los pagos"}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${showAll ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>
          </div>
        </>
      )}
    </section>
  );
}
