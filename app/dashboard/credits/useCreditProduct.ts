"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ESTADO_CONFIG } from "@/components/Dashboard/constants/request-status";
import { useCreditAccountDetails } from "@/hooks/use-credit-account-details";
import { useClientRequestStore } from "@/stores/client-request-store";
import { useClientDataStore } from "@/stores/client-data-store";
import { useCreditDetailsStore } from "@/stores/credit-details-store";
import { getRequestsByClient } from "@/services/client-requests";
import { formatPaymentFrequency, toPositiveNumber } from "@/utils/formatters";
import { isProtectedCredit, normalizeCreditType } from "@/utils/credit-type";
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

  const sessionClientId = useClientDataStore((state) => state.client?.id);
  const storeClientId = useClientRequestStore((state) => state.clientId);
  const resolvedClientId = sessionClientId
    ? Number(sessionClientId)
    : storeClientId;

  const [isSyncingRequests, setIsSyncingRequests] = useState(false);

  useEffect(() => {
    if (!resolvedClientId) return;

    let isMounted = true;
    if (!record) {
      setIsSyncingRequests(true);
    }

    getRequestsByClient(String(resolvedClientId))
      .catch((err) => {
        if (isMounted) {
          console.error("[useCreditProduct] Error fetching requests:", err);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsSyncingRequests(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [resolvedClientId]);

  const estado = record?.data.estado;
  const accountId = Number(record?.data.product_id ?? productIdParam ?? 0);

  const { accountDetails, isLoadingProduct, productError, isProductVisible } =
    useCreditAccountDetails({ accountId, estado });

  const requestData = record?.data;
  const evaluationId = requestData?.evaluation_id;
  const cachedScore = useCreditDetailsStore((state) =>
    evaluationId ? state.detailsCache[evaluationId] : undefined,
  );

  // La oferta solo varía el monto; plazo, tipo y frecuencia se leen de los campos solicitados.
  const creditType = normalizeCreditType(requestData?.tipo_de_credito_solicitado);
  const creditStatus = estado ? ESTADO_CONFIG[estado] : undefined;
  const plazo = requestData?.plazo_solicitado;
  const periodicidad = formatPaymentFrequency(requestData?.frecuencia_de_pago_solicitada);

  // --- Datos de la solicitud ---
  // toPositiveNumber devuelve null si el campo es 0, undefined o no finito.
  // La page.tsx ya tiene montoCredito > 0 ? formatMoney(...) : "—"
  const montoCredito =
    toPositiveNumber(requestData?.monto_ofertado) ??
    toPositiveNumber(requestData?.monto_solicitado) ??
    null;

  const pagoPorPeriodo = toPositiveNumber(requestData?.pago_por_periodo) ?? null;

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

  // Para crédito "protected" usamos exclusivamente el monto con seguros.
  // Si ese campo falta, retornamos null (no caemos al monto sin seguros,
  // ya que sería un valor financiero incorrecto para el cliente).
  // Para cualquier otro tipo usamos el monto sin seguros.
  // Como último recurso usamos summary?.totalAmount del endpoint live.
  const totalAPagarFromRequest = isProtectedCredit(creditType)
    ? (toPositiveNumber(requestData?.monto_total_a_pagar_con_seguros) ??
      toPositiveNumber(cachedScore?.scoreData.monto_total_a_pagar_con_seguros))
    : (toPositiveNumber(requestData?.monto_total_a_pagar) ??
      toPositiveNumber(cachedScore?.scoreData.monto_total_a_pagar));

  const totalAPagar = totalAPagarFromRequest ?? summary?.totalAmount ?? null;

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
    pagoPorPeriodo,
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
    isSyncingRequests,
  };
}
