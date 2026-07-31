// hooks/useCreditResult.ts
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useClientRequestStore } from "@/stores";
import { updateActiveRequestData } from "@/services/client-requests";
import { ROUTES } from "@/lib/routes";
import {
  normalizePaymentFrequency,
  formatPaymentFrequency,
  toPositiveNumber,
} from "@/utils/formatters";
import { calculateCreditBreakdown } from "@/utils/calculateCreditBreakdown";

export function useCreditResult() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setHydrated(true);
  }, []);

  const activeRequest = useClientRequestStore((state) =>
    state.getActiveRequest(),
  );
  const data = activeRequest?.data ?? {};

  const amount = toPositiveNumber(data.monto_solicitado) ?? 0;
  const term = toPositiveNumber(data.plazo_solicitado) ?? 12;
  const paymentFrequencyLabel = formatPaymentFrequency(
    normalizePaymentFrequency(data.frecuencia_de_pago_solicitada),
  );
  const creditData = calculateCreditBreakdown(data);

  const handleContinue = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      await updateActiveRequestData({
        paso_actual: ROUTES.ONBOARDING.CREDIT_AUTHORIZATION,
      });
      router.push(ROUTES.ONBOARDING.CREDIT_AUTHORIZATION);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo continuar. Intenta nuevamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => router.push(ROUTES.ONBOARDING.CREDIT_SELECTION);

  return {
    hydrated,
    amount,
    term,
    paymentFrequencyLabel,
    creditData,
    isSubmitting,
    error,
    handleContinue,
    goBack,
  };
}
