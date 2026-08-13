"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useClientRequestStore, useCreditDetailsStore } from "@/stores";
import { updateClientData } from "@/services/client-data";
import { ROUTES } from "@/lib/routes";
import {
  normalizePaymentFrequency,
  formatPaymentFrequency,
  toPositiveNumber,
} from "@/utils/formatters";
import {
  calculateCreditBreakdown,
  CreditBreakdownInput,
  CreditBreakdown,
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

  // El backend no persiste los campos del desglose en la solicitud; los leemos
  // del store local, donde useCreditSelection guardó el resultado del score
  // (mismo patrón de caché por evaluation_id que usa el Dashboard).
  const evaluationId = data.evaluation_id ?? "";
  const cached = useCreditDetailsStore((state) =>
    evaluationId ? state.detailsCache[evaluationId] : undefined,
  );

  const creditData: CreditBreakdown | null = cached?.scoreData
    ? calculateCreditBreakdown(
        {
          tipo_de_credito_solicitado:
            data.tipo_de_credito_ofertado ?? data.tipo_de_credito_solicitado,
          pago_por_periodo_sin_seguros:
            cached.scoreData.pago_por_periodo_sin_seguros,
          pago_por_periodo_con_seguros_iva:
            cached.scoreData.pago_por_periodo_con_seguros_iva,
          numero_de_periodos: cached.scoreData.numero_de_periodos,
          comision_apertura: cached.scoreData.comision_apertura,
          seguro_vida: cached.scoreData.seguro_vida_al_millar,
          seguro_invalidez_total_permanente:
            cached.scoreData.seguro_invalidez_al_millar,
          monto_total_a_pagar: cached.scoreData.monto_total_a_pagar,
        } satisfies CreditBreakdownInput,
        amount,
      )
    : null;

  const handleContinue = async () => {
    setIsSubmitting(true);
    setError("");
    const nextStep = ROUTES.ONBOARDING.CREDIT_SUCCESS;
    try {
      await updateClientData({ pii: { paso_actual: nextStep } });
      router.push(nextStep);
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
