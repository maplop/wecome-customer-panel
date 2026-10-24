"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ESTADO_CONFIG } from "@/components/Dashboard/constants/request-status";
import { useCreditAccountDetails } from "@/hooks/use-credit-account-details";
import { useClientRequestStore } from "@/stores/client-request-store";
import { useCreditDetailsStore } from "@/stores/credit-details-store";
import { formatPaymentFrequency } from "@/utils/formatters";
import { isProtectedCredit } from "@/utils/credit-type";
import type { CreditInstallment } from "@/types/credit-account";
import { parseFraction } from "./utils";

/**
 * Reúne la información del detalle del producto contratado: identifica la
 * solicitud por `product_id`, consulta el endpoint del producto y deriva los
 * valores que consumen las secciones del panel.
 */
export function useCreditProduct() {
  const searchParams = useSearchParams();
  // La consulta se hace por product_id (= account). Se acepta `id`
  // solo por compatibilidad con enlaces antiguos.
  const productIdParam =
    searchParams.get("product_id") ?? searchParams.get("id");

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
  const creditStatus = estado ? ESTADO_CONFIG[estado] : undefined;
  const plazo = requestData?.plazo_ofertado ?? requestData?.plazo_solicitado;
  const periodicidad = formatPaymentFrequency(
    requestData?.frecuencia_de_pago_ofertada ??
      requestData?.frecuencia_de_pago_solicitada,
  );

  // --- Datos de la solicitud ---
  const montoCredito = Number(
    requestData?.monto_ofertado ?? requestData?.monto_solicitado ?? 0,
  );

  // --- Datos del endpoint (producto contratado) ---
  const summary = accountDetails?.summary;
  const saldoPendiente = summary?.currentAmount;
  const overdueAmount = summary?.overdueAmount ?? 0;
  const lateTerms = summary?.lateTerms ?? 0;

  const [paidAmount, paidTotal] = parseFraction(summary?.paidAmountLabel);
  const [completedPayments, totalPaymentsFromLabel] = parseFraction(
    summary?.paidTermsLabel,
  );
  const totalPayments = summary?.totalTerms ?? totalPaymentsFromLabel;
  const progressPct =
    paidTotal > 0
      ? Math.min(100, Math.round((paidAmount / paidTotal) * 100))
      : 0;

  console.log("isProtectedCredit -- ", isProtectedCredit(creditType));

  const totalAPagarFromCredit = isProtectedCredit(creditType)
    ? (requestData?.monto_total_a_pagar_con_seguros ??
      cachedScore?.scoreData.monto_total_a_pagar_con_seguros ??
      requestData?.monto_total_a_pagar ??
      cachedScore?.scoreData.monto_total_a_pagar)
    : (requestData?.monto_total_a_pagar ??
      cachedScore?.scoreData.monto_total_a_pagar);

  console.log("requestData -- ", requestData);

  const totalAPagar =
    totalAPagarFromCredit != null &&
    Number.isFinite(Number(totalAPagarFromCredit))
      ? Number(totalAPagarFromCredit)
      : summary?.totalAmount;

  const pendingGroup = accountDetails?.pending;
  const upcomingGroup = accountDetails?.upcoming;
  const settledGroup = accountDetails?.settled;
  const amortizationTable = accountDetails?.amortizationTable ?? [];

  const nextAmortizationRow = amortizationTable.find((row) => !row.isPaid);
  const nextInstallment: CreditInstallment | null =
    pendingGroup?.installments[0] ??
    (nextAmortizationRow
      ? {
          term: String(nextAmortizationRow.term),
          dueDate: nextAmortizationRow.dueDate,
          amount:
            nextAmortizationRow.detail?.total ||
            nextAmortizationRow.totalPayment.expected,
          status: "open",
          paid: 0,
          late: 0,
          isOverdue: false,
          detail: nextAmortizationRow.detail,
        }
      : (upcomingGroup?.previousTerm ?? null));
  const upcomingInstallments = pendingGroup?.installments ?? [];
  const overdueInstallments = upcomingGroup?.installments ?? [];

  return {
    productIdParam,
    accountId,
    estado,
    hasRecord: Boolean(record),
    hasSummary: summary != null,
    // Solicitud
    montoCredito,
    creditType,
    creditStatus,
    plazo,
    periodicidad,
    // Producto
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
    // Estado de la consulta
    isLoadingProduct,
    productError,
    isProductVisible,
  };
}
