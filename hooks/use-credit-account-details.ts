"use client";

import { useEffect, useState } from "react";
import { getCreditAccountDetails } from "@/services/credit-account";
import type { CreditAccountDetails } from "@/types/credit-account";

const VISIBLE_ESTADOS = ["approved", "active", "completed"] as const;

export type VisibleCreditEstado = (typeof VISIBLE_ESTADOS)[number];

export function isProductDashboardVisible(
  estado: string | undefined,
): estado is VisibleCreditEstado {
  return (
    estado === "approved" || estado === "active" || estado === "completed"
  );
}

interface UseCreditAccountDetailsInput {
  accountId: number;
  estado: string | undefined;
}

interface UseCreditAccountDetailsResult {
  /** Detalle del producto: resumen, plazos y tabla de amortización. */
  accountDetails: CreditAccountDetails | null;
  /** Atajo a la tabla de amortización. */
  amortizationTable: CreditAccountDetails["amortizationTable"];
  isLoadingProduct: boolean;
  productError: string | null;
  isProductVisible: boolean;
}

export function useCreditAccountDetails({
  accountId,
  estado,
}: UseCreditAccountDetailsInput): UseCreditAccountDetailsResult {
  const isProductVisible =
    isProductDashboardVisible(estado) &&
    Number.isFinite(accountId) &&
    accountId > 0;

  const [accountDetails, setAccountDetails] =
    useState<CreditAccountDetails | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);

  useEffect(() => {
    if (!isProductVisible) return;

    let cancelled = false;
    setIsLoadingProduct(true);
    setProductError(null);

    getCreditAccountDetails(accountId)
      .then((details) => {
        if (cancelled) return;
        setAccountDetails(details);
        // De momento no se consume en la UI, solo se imprime.
        console.log("[producto-contratado]", details);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("[producto-contratado] error", error);
        setProductError(
          error instanceof Error
            ? error.message
            : "No se pudo cargar el detalle del producto.",
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoadingProduct(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isProductVisible, accountId]);

  return {
    accountDetails,
    amortizationTable: accountDetails?.amortizationTable ?? [],
    isLoadingProduct,
    productError,
    isProductVisible,
  };
}
