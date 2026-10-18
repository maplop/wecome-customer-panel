"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ROUTES } from "@/lib/routes";
import {
  CalendarClock,
  Check,
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  Download,
  Shield,
  ShieldCheck,
  Wallet,
  Receipt,
  AlertTriangle,
  CalendarDays,
} from "@/lib/icons";
import { formatMoney, formatPaymentFrequency, formatDateLongEs } from "@/utils/formatters";
import { getCreditTypeLabel, isProtectedCredit } from "@/utils/credit-type";
import { ESTADO_CONFIG } from "@/components/Dashboard/constants/request-status";
import { useClientRequestStore } from "@/stores/client-request-store";
import { useCreditDetailsStore } from "@/stores/credit-details-store";
import { useCreditAccountDetails } from "@/hooks/use-credit-account-details";
import { LoadingState } from "@/components/common/LoadingState";
import type {
  CreditAmortizationRow,
  CreditInstallment,
} from "@/types/credit-account";

function safeMoney(value?: number | null): string {
  return value != null && Number.isFinite(value) ? formatMoney(value) : "—";
}

function formatShortDate(value?: string | null): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// "0.00/49412.04" -> [0, 49412.04]
function parseFraction(label?: string | null): [number, number] {
  if (!label) return [0, 0];
  const [paid, total] = label.split("/");
  const paidNum = Number(paid);
  const totalNum = Number(total);
  return [
    Number.isFinite(paidNum) ? paidNum : 0,
    Number.isFinite(totalNum) ? totalNum : 0,
  ];
}

function installmentStatusMeta(row: CreditAmortizationRow) {
  if (row.isPaid) {
    return { ...ESTADO_CONFIG.completed, label: "Pagado" };
  }
  if (row.isPast && !row.isPaid) {
    return {
      label: "Vencido",
      className: "bg-red-500/10 text-red-600 dark:text-red-400",
      dot: "bg-red-500",
    };
  }
  return { ...ESTADO_CONFIG.pending, label: "Pendiente" };
}

function SummaryCard({
  label,
  value,
  description,
  icon,
  highlighted,
}: {
  label: string;
  value: React.ReactNode;
  description?: React.ReactNode;
  icon: React.ReactNode;
  highlighted?: boolean;
}) {
  return (
    <article
      className={`flex min-h-40 flex-col justify-between gap-4 rounded-2xl border p-5 shadow-sm sm:p-6 ${highlighted ? "border-brand-dark bg-brand-dark text-white" : "border-border bg-card"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <p className={`text-sm ${highlighted ? "text-white/60" : "text-muted-foreground"}`}>{label}</p>
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${highlighted ? "bg-white/10 text-brand-accent" : "bg-brand-accent/10 text-brand-accent"}`}>
          {icon}
        </span>
      </div>
      <div className="min-w-0">
        <div className={`truncate text-xl font-semibold tracking-tight ${highlighted ? "text-white" : "text-brand-accent"}`}>
          {value}
        </div>
        {description && (
          <div className={`mt-2 text-sm ${highlighted ? "text-white/60" : "text-muted-foreground"}`}>
            {description}
          </div>
        )}
      </div>
    </article>
  );
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

function BackButton() {
  return (
    <Link
      href={ROUTES.DASHBOARD.ROOT}
      className="inline-flex w-fit items-center gap-2 rounded-lg bg-brand-accent px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90"
    >
      <span aria-hidden="true">←</span>
      Volver a mis solicitudes
    </Link>
  );
}

function downloadAmortizationTable(rows: CreditAmortizationRow[]) {
  const csvRows = [
    [
      "Pago",
      "Fecha límite",
      "Pago base",
      "Seguro desempleo",
      "IVA seguro desempleo",
      "Seguro saldo",
      "IVA seguro saldo",
      "Pago total",
      "Capital",
      "Interés",
      "IVA interés",
      "Saldo restante",
      "Estado",
    ],
    ...rows.map((row) => {
      const status = installmentStatusMeta(row).label;
      return [
        String(row.term).padStart(2, "0"),
        row.dueDate,
        formatMoney(row.payment.expected),
        formatMoney(row.unemploymentInsurance.expected),
        formatMoney(row.unemploymentInsuranceTax.expected),
        formatMoney(row.outstandingBalanceInsurance.expected),
        formatMoney(row.outstandingBalanceInsuranceTax.expected),
        formatMoney(row.totalPayment.expected),
        formatMoney(row.principal.expected),
        formatMoney(row.interest.expected),
        formatMoney(row.interestTax.expected),
        formatMoney(row.finalBalance),
        status,
      ];
    }),
  ];
  const csv = csvRows
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
  const searchParams = useSearchParams();
  // La consulta se hace por product_id (= account). Se acepta `id`
  // solo por compatibilidad con enlaces antiguos.
  const productIdParam =
    searchParams.get("product_id") ?? searchParams.get("id");
  const [showAllPayments, setShowAllPayments] = useState(false);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const requests = useClientRequestStore((state) => state.requests);
  const record = useMemo(() => {
    if (!productIdParam) return null;
    return (
      requests.find(
        (item) => String(item.data.product_id ?? "") === productIdParam,
      ) ??
      requests.find((item) => item.id === productIdParam) ??
      null
    );
  }, [requests, productIdParam]);
  const estado = record?.data.estado;
  const accountId = Number(record?.data.product_id ?? productIdParam ?? 0);

  const { accountDetails, isLoadingProduct, productError, isProductVisible } =
    useCreditAccountDetails({ accountId, estado });

  const requestData = record?.data;
  const evaluationId = requestData?.evaluation_id;
  const cachedScore = useCreditDetailsStore((state) =>
    evaluationId ? state.detailsCache[evaluationId] : undefined,
  );
  const creditType =
    requestData?.tipo_de_credito_ofertado ??
    requestData?.tipo_de_credito_solicitado ??
    "";
  const CreditTypeIcon = isProtectedCredit(creditType) ? ShieldCheck : Shield;
  const creditStatus = estado ? ESTADO_CONFIG[estado] : undefined;
  const plazo = requestData?.plazo_ofertado ?? requestData?.plazo_solicitado;
  const periodicidad = formatPaymentFrequency(
    requestData?.frecuencia_de_pago_ofertada ??
      requestData?.frecuencia_de_pago_solicitada,
  );
  const tasaAnualPct =
    cachedScore?.scoreData.configuracion_credito?.tasa_interes_anual_pct;
  const tasaAnual =
    tasaAnualPct != null && Number.isFinite(Number(tasaAnualPct))
      ? `${Number(tasaAnualPct).toFixed(2)}%`
      : "—";

  // --- Datos de la solicitud ---
  const montoCredito = Number(
    requestData?.monto_ofertado ?? requestData?.monto_solicitado ?? 0,
  );

  // --- Datos del endpoint (producto contratado) ---
  const summary = accountDetails?.summary;
  const totalAPagarEndpoint = summary?.totalAmount;
  const saldoPendiente = summary?.currentAmount;
  const overdueAmount = summary?.overdueAmount ?? 0;
  const lateTerms = summary?.lateTerms ?? 0;

  const [paidAmount, paidTotal] = parseFraction(summary?.paidAmountLabel);
  const [completedPayments, totalPaymentsFromLabel] = parseFraction(
    summary?.paidTermsLabel,
  );
  const totalPayments = summary?.totalTerms ?? totalPaymentsFromLabel;
  const progressPct =
    paidTotal > 0 ? Math.min(100, Math.round((paidAmount / paidTotal) * 100)) : 0;

  const pendingGroup = accountDetails?.pending;
  const upcomingGroup = accountDetails?.upcoming;
  const settledGroup = accountDetails?.settled;
  const amortizationTable = accountDetails?.amortizationTable ?? [];

  const nextInstallment: CreditInstallment | null =
    pendingGroup?.installments[0] ??
    upcomingGroup?.previousTerm ??
    null;
  const upcomingInstallments = pendingGroup?.installments ?? [];
  const overdueInstallments = upcomingGroup?.installments ?? [];

  const visiblePayments = showAllPayments
    ? amortizationTable
    : amortizationTable.slice(0, 6);
  const visibleUpcoming = showAllUpcoming
    ? upcomingInstallments
    : upcomingInstallments.slice(0, 5);

  if (!record) {
    return (
      <section className="flex flex-col gap-4 pb-4">
        <BackButton />
        <p className="text-sm text-muted-foreground">
          No se encontró el producto ({productIdParam ?? "sin product_id"}).
        </p>
      </section>
    );
  }

  if (!isProductVisible && !isLoadingProduct) {
    if (!accountId) {
      return (
        <section className="flex flex-col gap-4 pb-4">
          <BackButton />
          <p className="text-sm text-muted-foreground">
            No se encontró el product_id en la solicitud para consultar el
            detalle del producto.
          </p>
        </section>
      );
    }
    return (
      <section className="flex flex-col gap-4 pb-4">
        <BackButton />
        <p className="text-sm text-muted-foreground">
          Este panel solo está disponible para créditos aprobados, activos o
          finalizados (estado actual: {estado ?? "desconocido"}).
        </p>
      </section>
    );
  }

  if (isLoadingProduct) {
    return (
      <section
        className="flex min-h-[60vh] flex-1 flex-col gap-4 pb-4"
        aria-busy="true"
      >
        <BackButton />
        <div className="flex flex-1 items-center justify-center">
          <LoadingState label="Cargando detalle del producto..." />
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4 pb-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground">Detalle del producto</h1>
          <p className="text-sm text-muted-foreground">
            ID del producto:{" "}
            <span className="font-medium text-foreground">
              {accountId || "No disponible"}
            </span>
          </p>
        </div>
        <BackButton />
      </div>

      {productError && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          No se pudo cargar el detalle del producto: {productError}
        </p>
      )}

      {/* Cards resumen */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Monto del crédito"
          value={montoCredito > 0 ? formatMoney(montoCredito) : "—"}
          description="Importe original"
          icon={<CreditCard className="h-6 w-6" aria-hidden="true" />}
        />

        <article className="flex min-h-40 flex-col justify-between gap-4 rounded-2xl border border-brand-dark bg-brand-dark p-5 text-white shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm text-white/60">Total a pagar</p>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-brand-accent">
              <CircleDollarSign className="h-6 w-6" aria-hidden="true" />
            </span>
          </div>
          <div className="min-w-0">
            <div className="truncate text-xl font-semibold tracking-tight text-white">
              {safeMoney(totalAPagarEndpoint)}
            </div>
            <div className="mt-2 text-sm text-white/60">Monto total del producto</div>
          </div>
        </article>

        <SummaryCard
          label="Saldo pendiente"
          value={safeMoney(saldoPendiente)}
          description="Saldo por pagar"
          icon={<Wallet className="h-6 w-6" aria-hidden="true" />}
        />

        <SummaryCard
          label="Próximo pago"
          value={
            nextInstallment ? formatMoney(nextInstallment.amount) : "—"
          }
          description={
            nextInstallment
              ? formatDateLongEs(nextInstallment.dueDate)
              : "Sin pagos programados"
          }
          icon={<CalendarClock className="h-6 w-6" aria-hidden="true" />}
        />
      </div>

      {/* Progreso + Detalles del crédito */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <article className="flex min-w-0 flex-col rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6 xl:col-span-2">
          <div>
            <h2 className="text-base font-semibold text-foreground">Progreso del crédito</h2>
            <p className="mt-1 text-sm text-muted-foreground">Avance de tus pagos programados</p>
          </div>

          <p className="mt-6 text-2xl font-semibold text-brand-accent">
            {progressPct}%
          </p>
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
                {summary ? safeMoney(paidAmount) : "—"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Por pagar</p>
              <p className="mt-1 font-semibold text-foreground">
                {safeMoney(saldoPendiente)}
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
              <dd className="text-right text-sm font-semibold text-foreground">{plazo ? `${plazo} meses` : "—"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm text-muted-foreground">Periodicidad</dt>
              <dd className="text-right text-sm font-semibold text-foreground">{periodicidad}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm text-muted-foreground">Tasa anual</dt>
              <dd className="text-right text-sm font-semibold text-foreground">{tasaAnual}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm text-muted-foreground">Estatus</dt>
              <dd>
                {creditStatus ? (
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${creditStatus.className}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${creditStatus.dot}`} />
                    {creditStatus.label}
                  </span>
                ) : (
                  "—"
                )}
              </dd>
            </div>
          </dl>
        </article>
      </div>

      {/* Resumen de pagos por estado */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div>
          <h2 className="text-base font-semibold text-foreground">Resumen de pagos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Estado de tus plazos según el producto contratado
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Vencidos</p>
              <p className="text-lg font-semibold text-foreground">
                {upcomingGroup?.totalTerms ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">
                {safeMoney(upcomingGroup?.totalAmount)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Receipt className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Pendientes</p>
              <p className="text-lg font-semibold text-foreground">
                {pendingGroup?.totalTerms ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">
                {safeMoney(pendingGroup?.totalAmount)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Check className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Pagados</p>
              <p className="text-lg font-semibold text-foreground">
                {settledGroup?.totalTerms ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">
                {safeMoney(settledGroup?.totalAmount)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mora y atrasos */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-foreground">Mora y atrasos</h2>
          <p className="text-sm text-muted-foreground">
            {overdueInstallments.length > 0
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
            value={formatShortDate(overdueInstallments[0]?.dueDate)}
          />
          <InfoStat
            label="Días de atraso máx."
            value={
              overdueInstallments.length > 0
                ? Math.max(...overdueInstallments.map((i) => i.late ?? 0))
                : 0
            }
            tone={
              overdueInstallments.some((i) => (i.late ?? 0) > 0)
                ? "warning"
                : "success"
            }
          />
        </div>

        {overdueInstallments.length > 0 && (
          <ul className="mt-5 flex flex-col divide-y divide-border rounded-xl border border-border">
            {overdueInstallments.map((installment) => (
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

      {/* Tabla de amortización */}
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
            onClick={() => downloadAmortizationTable(amortizationTable)}
            disabled={amortizationTable.length === 0}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-secondary disabled:opacity-50"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Descargar tabla
          </button>
        </header>

        {amortizationTable.length === 0 ? (
          <p className="mt-5 text-sm text-muted-foreground">
            No hay datos de amortización disponibles.
          </p>
        ) : (
          <>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[1000px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-foreground">
                    <th scope="col" className="px-2 py-3 font-semibold">Pago</th>
                    <th scope="col" className="px-2 py-3 font-semibold">Fecha límite</th>
                    <th scope="col" className="px-2 py-3 text-right font-semibold">Pago base</th>
                    <th scope="col" className="px-2 py-3 text-right font-semibold">Seguros</th>
                    <th scope="col" className="px-2 py-3 text-right font-semibold">Pago total</th>
                    <th scope="col" className="px-2 py-3 text-right font-semibold">Capital</th>
                    <th scope="col" className="px-2 py-3 text-right font-semibold">Interés</th>
                    <th scope="col" className="px-2 py-3 text-right font-semibold">Saldo restante</th>
                    <th scope="col" className="px-2 py-3 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {visiblePayments.map((row) => {
                    const status = installmentStatusMeta(row);
                    const insurance =
                      row.unemploymentInsurance.expected +
                      row.unemploymentInsuranceTax.expected +
                      row.outstandingBalanceInsurance.expected +
                      row.outstandingBalanceInsuranceTax.expected;
                    return (
                      <tr
                        key={row.term}
                        className="border-b border-border/70 transition-colors hover:bg-secondary/50 last:border-b-0"
                      >
                        <th scope="row" className="px-2 py-3 text-left font-semibold text-foreground">
                          {String(row.term).padStart(2, "0")}
                        </th>
                        <td className="whitespace-nowrap px-2 py-3 text-foreground">{row.dueDate}</td>
                        <td className="whitespace-nowrap px-2 py-3 text-right text-foreground">
                          {formatMoney(row.payment.expected)}
                        </td>
                        <td className="whitespace-nowrap px-2 py-3 text-right text-muted-foreground">
                          {formatMoney(insurance)}
                        </td>
                        <td className="whitespace-nowrap px-2 py-3 text-right font-semibold text-foreground">
                          {formatMoney(row.totalPayment.expected)}
                        </td>
                        <td className="whitespace-nowrap px-2 py-3 text-right text-foreground">
                          {formatMoney(row.principal.expected)}
                        </td>
                        <td className="whitespace-nowrap px-2 py-3 text-right text-muted-foreground">
                          {formatMoney(row.interest.expected)}
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
          </>
        )}
      </section>

      {/* Próximos pagos */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div>
          <h2 className="text-base font-semibold text-foreground">Próximos pagos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Plazos pendientes de tu crédito
          </p>
        </div>

        {upcomingInstallments.length === 0 ? (
          <p className="mt-5 text-sm text-muted-foreground">
            No tienes pagos pendientes.
          </p>
        ) : (
          <>
            <ul className="mt-5 flex flex-col divide-y divide-border rounded-xl border border-border">
              {visibleUpcoming.map((installment, index) => (
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

            {upcomingInstallments.length > 5 && (
              <div className="mt-4 flex justify-center border-t border-border pt-3">
                <button
                  type="button"
                  onClick={() => setShowAllUpcoming((current) => !current)}
                  aria-expanded={showAllUpcoming}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-brand-dark transition hover:bg-secondary"
                >
                  {showAllUpcoming ? "Ver menos" : `Ver los ${upcomingInstallments.length} pagos`}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${showAllUpcoming ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>
              </div>
            )}
          </>
        )}
      </section>
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
