"use client";

import { Suspense } from "react";
import Link from "next/link";
import {
  CalendarClock,
  CircleDollarSign,
  CreditCard,
  Wallet,
} from "@/lib/icons";
import { ROUTES } from "@/lib/routes";
import { formatDateLongEs, formatMoney } from "@/utils/formatters";
import { LoadingState } from "@/components/common/LoadingState";
import {
  AmortizationTable,
  CreditDetailsCard,
  LatePaymentsCard,
  PaymentSummaryCard,
  ProgressCard,
  SummaryCard,
  UpcomingPayments,
} from "./components";
import { useCreditProduct } from "./useCreditProduct";
import { safeMoney } from "./utils";

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

function CreditDetailsContent() {
  const {
    productIdParam,
    accountId,
    estado,
    hasRecord,
    hasSummary,
    montoCredito,
    creditType,
    creditStatus,
    plazo,
    periodicidad,
    totalAPagar,
    saldoPendiente,
    overdueAmount,
    lateTerms,
    paidAmount,
    completedPayments,
    totalPayments,
    progressPct,
    nextInstallment,
    pendingGroup,
    upcomingGroup,
    settledGroup,
    upcomingInstallments,
    overdueInstallments,
    amortizationTable,
    isLoadingProduct,
    productError,
    isProductVisible,
  } = useCreditProduct();

  if (!hasRecord) {
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

        <SummaryCard
          label="Total a pagar"
          value={safeMoney(totalAPagar)}
          description="Monto total del producto"
          highlighted
          icon={<CircleDollarSign className="h-6 w-6" aria-hidden="true" />}
        />

        <SummaryCard
          label="Saldo pendiente"
          value={safeMoney(saldoPendiente)}
          description="Saldo por pagar"
          icon={<Wallet className="h-6 w-6" aria-hidden="true" />}
        />

        <SummaryCard
          label="Próximo pago"
          value={nextInstallment ? formatMoney(nextInstallment.amount) : "—"}
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
        <ProgressCard
          progressPct={progressPct}
          hasSummary={hasSummary}
          paidAmount={paidAmount}
          pendingAmount={saldoPendiente}
          completedPayments={completedPayments}
          totalPayments={totalPayments}
        />
        <CreditDetailsCard
          creditType={creditType}
          plazo={plazo}
          periodicidad={periodicidad}
          status={creditStatus}
        />
      </div>

      <PaymentSummaryCard
        overdue={{
          terms: upcomingGroup?.totalTerms ?? 0,
          amount: upcomingGroup?.totalAmount,
        }}
        pending={{
          terms: pendingGroup?.totalTerms ?? 0,
          amount: pendingGroup?.totalAmount,
        }}
        settled={{
          terms: settledGroup?.totalTerms ?? 0,
          amount: settledGroup?.totalAmount,
        }}
      />

      <LatePaymentsCard
        overdueAmount={overdueAmount}
        lateTerms={lateTerms}
        installments={overdueInstallments}
      />

      <AmortizationTable rows={amortizationTable} />

      <UpcomingPayments
        installments={upcomingInstallments}
        totalPayments={totalPayments}
      />
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
