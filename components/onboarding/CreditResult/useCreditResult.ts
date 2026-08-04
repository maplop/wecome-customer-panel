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
import {
  calculateCreditBreakdown,
  CreditBreakdownInput,
} from "@/utils/calculateCreditBreakdown";

export function useCreditResult() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const activeRequest = useClientRequestStore((state) =>
    state.getActiveRequest(),
  );

  const data = activeRequest?.data ?? {};

  const amount = toPositiveNumber(data.monto_solicitado) ?? 0;
  const term = toPositiveNumber(data.plazo_solicitado) ?? 12;
  const paymentFrequencyLabel = formatPaymentFrequency(
    normalizePaymentFrequency(data.frecuencia_de_pago_solicitada),
  );

  const creditInput: CreditBreakdownInput = {
    tipo_de_credito_solicitado:
      data.tipo_de_credito_ofertado ?? data.tipo_de_credito_solicitado,
    pago_por_periodo_sin_seguros: data.pago_por_periodo_sin_seguros,
    pago_por_periodo_con_seguros_iva: data.pago_por_periodo_con_seguros_iva,
    numero_de_periodos: data.numero_de_periodos,
    comision_apertura: data.comision_apertura,
    seguro_vida: data.seguro_vida,
    seguro_invalidez_total_permanente: data.seguro_invalidez_total_permanente,
    monto_total_a_pagar: data.monto_total_a_pagar ?? 0,
  };

  const creditData = calculateCreditBreakdown(creditInput, amount);

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
