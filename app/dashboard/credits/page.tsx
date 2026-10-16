"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ROUTES } from "@/lib/routes";
import { CalendarClock, Check, ChevronDown, CircleDollarSign, CreditCard, Download, FileText, Shield, ShieldCheck, Wallet } from "@/lib/icons";
import { formatMoney } from "@/utils/formatters";
import { getCreditTypeLabel, isProtectedCredit } from "@/utils/credit-type";
import { ESTADO_CONFIG } from "@/components/Dashboard/constants/request-status";

const MOCK_CREDIT_TYPE = "protected";
const MOCK_CREDIT_STATUS = "active";

const CREDIT_SUMMARY = [
  {
    label: "Monto del crédito",
    value: "$40,000.00",
    description: "Importe original",
    Icon: CreditCard,
  },
  {
    label: "Total a pagar",
    value: "$48,000.00",
    description: "Monto total del crédito",
    Icon: CircleDollarSign,
  },
  {
    label: "Saldo pendiente",
    value: "$32,000.00",
    description: "Saldo por pagar",
    Icon: Wallet,
  },
  {
    label: "Próximo pago",
    value: "$4,000.00",
    description: "23 de octubre de 2026",
    Icon: CalendarClock,
  },
] as const;

const CREDIT_PROGRESS = {
  percentage: 33,
  paid: "$16,000.00",
  pending: "$32,000.00",
  completedPayments: 4,
  totalPayments: 12,
};

const AMORTIZATION_DUE_DATES = [
  "24 ago 2026",
  "08 sep 2026",
  "23 sep 2026",
  "08 oct 2026",
  "23 oct 2026",
  "07 nov 2026",
  "22 nov 2026",
  "07 dic 2026",
  "22 dic 2026",
  "06 ene 2027",
  "21 ene 2027",
  "05 feb 2027",
];

const AMORTIZATION_PAYMENTS = AMORTIZATION_DUE_DATES.map((dueDate, index) => {
  const startingBalance = 40_000;
  const regularPrincipal = 3_333.33;
  const balanceBeforePayment = startingBalance - regularPrincipal * index;
  const principal =
    index === AMORTIZATION_DUE_DATES.length - 1
      ? balanceBeforePayment
      : regularPrincipal;
  const interest = 4_000 - principal;

  return {
    number: index + 1,
    dueDate,
    payment: 4_000,
    principal,
    interest,
    remainingBalance: Math.max(0, balanceBeforePayment - principal),
    isPaid: index < CREDIT_PROGRESS.completedPayments,
  };
});

function downloadAmortizationTable() {
  const rows = [
    ["Pago", "Fecha límite", "Pago total", "Capital", "Interés", "Saldo restante", "Estado"],
    ...AMORTIZATION_PAYMENTS.map((payment) => [
      String(payment.number).padStart(2, "0"),
      payment.dueDate,
      formatMoney(payment.payment),
      formatMoney(payment.principal),
      formatMoney(payment.interest),
      formatMoney(payment.remainingBalance),
      payment.isPaid ? "Pagado" : "Pendiente",
    ]),
  ];
  const csv = rows
    .map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(","))
    .join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "tabla-de-amortizacion.csv";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

function CreditDetailsContent() {
  const requestId = useSearchParams().get("id");
  const [showAllPayments, setShowAllPayments] = useState(false);
  const CreditTypeIcon = isProtectedCredit(MOCK_CREDIT_TYPE) ? ShieldCheck : Shield;
  const creditStatus = ESTADO_CONFIG[MOCK_CREDIT_STATUS];
  const visiblePayments = showAllPayments
    ? AMORTIZATION_PAYMENTS
    : AMORTIZATION_PAYMENTS.slice(0, 6);

  return (
    <section className="flex flex-col gap-4 pb-4">
      <Link
        href={ROUTES.DASHBOARD.ROOT}
        className="inline-flex w-fit items-center gap-2 rounded-lg bg-brand-dark px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90"
      >
        <span aria-hidden="true">←</span>
        Atrás
      </Link>
      <h1 className="text-2xl font-bold text-foreground">Detalle de la solicitud</h1>
      <p className="text-sm text-muted-foreground">
        ID de la solicitud: {" "}
        <span className="font-medium text-foreground">
          {requestId ?? "No disponible"}
        </span>
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CREDIT_SUMMARY.map(({ label, value, description, Icon }) => (
          <article
            key={label}
            className="flex min-h-40 items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
          >
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-3 truncate text-xl font-semibold tracking-tight text-brand-accent">
                {value}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </div>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-accent/10 text-brand-accent">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <article className="flex min-w-0 flex-col rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6 xl:col-span-2">
          <div>
            <h2 className="text-base font-semibold text-foreground">Progreso del crédito</h2>
            <p className="mt-1 text-sm text-muted-foreground">Avance de tus pagos programados</p>
          </div>

          <p className="mt-6 text-2xl font-semibold text-brand-accent">
            {CREDIT_PROGRESS.percentage}%
          </p>
          <div
            role="progressbar"
            aria-label="Progreso del crédito"
            aria-valuenow={CREDIT_PROGRESS.percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-4 h-2 overflow-hidden rounded-full bg-secondary"
          >
            <div
              className="h-full rounded-full bg-brand-accent transition-[width]"
              style={{ width: `${CREDIT_PROGRESS.percentage}%` }}
            />
          </div>

          <div className="mt-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Pagado</p>
              <p className="mt-1 font-semibold text-foreground">{CREDIT_PROGRESS.paid}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Por pagar</p>
              <p className="mt-1 font-semibold text-foreground">{CREDIT_PROGRESS.pending}</p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">Pagos completados</p>
            <p className="text-right text-sm font-semibold text-foreground">
              {CREDIT_PROGRESS.completedPayments} de {CREDIT_PROGRESS.totalPayments} pagos
            </p>
          </div>
        </article>

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
                {getCreditTypeLabel(MOCK_CREDIT_TYPE)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm text-muted-foreground">Plazo</dt>
              <dd className="text-right text-sm font-semibold text-foreground">12 quincenas</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm text-muted-foreground">Periodicidad</dt>
              <dd className="text-right text-sm font-semibold text-foreground">Quincenal</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm text-muted-foreground">Tasa anual</dt>
              <dd className="text-right text-sm font-semibold text-foreground">60.00%</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm text-muted-foreground">Estatus</dt>
              <dd>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${creditStatus.className}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${creditStatus.dot}`} />
                  {creditStatus.label}
                </span>
              </dd>
            </div>
          </dl>
        </article>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Tabla de amortización</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Consulta el detalle de cada pago y cómo se reduce tu saldo.
            </p>
          </div>
          <button
            type="button"
            onClick={downloadAmortizationTable}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-secondary"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Descargar tabla
          </button>
        </header>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-foreground">
                <th scope="col" className="px-2 py-3 font-semibold">Pago</th>
                <th scope="col" className="px-2 py-3 font-semibold">Fecha límite</th>
                <th scope="col" className="px-2 py-3 text-right font-semibold">Pago total</th>
                <th scope="col" className="px-2 py-3 text-right font-semibold">Capital</th>
                <th scope="col" className="px-2 py-3 text-right font-semibold">Interés</th>
                <th scope="col" className="px-2 py-3 text-right font-semibold">Saldo restante</th>
                <th scope="col" className="px-2 py-3 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {visiblePayments.map((payment) => (
                <tr
                  key={payment.number}
                  className="border-b border-border/70 transition-colors hover:bg-secondary/50 last:border-b-0"
                >
                  <th scope="row" className="px-2 py-3 text-left font-semibold text-foreground">
                    {String(payment.number).padStart(2, "0")}
                  </th>
                  <td className="whitespace-nowrap px-2 py-3 text-foreground">{payment.dueDate}</td>
                  <td className="whitespace-nowrap px-2 py-3 text-right font-semibold text-foreground">
                    {formatMoney(payment.payment)}
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 text-right text-foreground">
                    {formatMoney(payment.principal)}
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 text-right text-muted-foreground">
                    {formatMoney(payment.interest)}
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 text-right text-foreground">
                    {formatMoney(payment.remainingBalance)}
                  </td>
                  <td className="px-2 py-3">
                    <span
                      className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                        payment.isPaid
                        ? ESTADO_CONFIG.completed.className
                          : ESTADO_CONFIG.pending.className
                      }`}
                    >
                      <span
                        className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
                          payment.isPaid ? ESTADO_CONFIG.completed.dot : ESTADO_CONFIG.pending.dot
                        }`}
                      />
                      {payment.isPaid ? "Pagado" : "Pendiente"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-center border-t border-border pt-3">
          <button
            type="button"
            onClick={() => setShowAllPayments((current) => !current)}
            aria-expanded={showAllPayments}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-brand-dark transition hover:bg-secondary"
          >
            {showAllPayments ? "Ver menos pagos" : "Ver todos los pagos"}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showAllPayments ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <article className="flex min-h-36 items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6 xl:col-span-2">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-accent/10 text-brand-accent">
            <FileText className="h-7 w-7" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground">
              Tu próximo pago es el 23 de octubre
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Tendrás hasta esa fecha para cubrir $4,000.00. Mantener tus pagos al corriente evita cargos adicionales.
            </p>
          </div>
        </article>

        <article className="flex min-h-36 items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-success/10 text-brand-success">
            <Check className="h-7 w-7" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground">Sin pagos vencidos</h2>
            <p className="mt-1 text-sm text-muted-foreground">Todo en orden</p>
          </div>
        </article>
      </div>
    </section>
  );
}

export default function CreditDetailsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando solicitud...</p>}>
      <CreditDetailsContent />
    </Suspense>
  );
}
