"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useClientRequestStore,
  useCreditDetailsStore,
  useClientDataStore,
} from "@/stores";
import { updateClientData } from "@/services/client-data";
import { runQdetectFind } from "@/services/onboarding/qdetect";
import { ROUTES } from "@/lib/routes";
import {
  normalizePaymentFrequency,
  formatPaymentFrequency,
  toPositiveNumber,
} from "@/utils/formatters";
import {
  calculateCreditBreakdown,
  type CreditBreakdown,
} from "@/utils/calculateCreditBreakdown";
import { normalizeCreditType } from "@/utils/credit-type";

export function useCreditResult() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const activeRequest = useClientRequestStore((state) =>
    state.getActiveRequest(),
  );

  const clientId = useClientDataStore((state) => state.client?.id);

  const data = activeRequest?.data ?? {};

  const amount = toPositiveNumber(data.monto_solicitado);
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

  const tipoDeCredito = normalizeCreditType(data.tipo_de_credito_solicitado);

  const creditData: CreditBreakdown | null =
    cached?.scoreData && tipoDeCredito
      ? calculateCreditBreakdown(cached.scoreData, tipoDeCredito)
      : null;

  const handleContinue = async () => {
    setIsSubmitting(true);
    setError("");
    const nextStep = ROUTES.ONBOARDING.CREDIT_SUCCESS;
    try {
      // No avanzamos hasta que la consulta Qdetect termine (success o error).
      // runQdetectFind nunca lanza, así que un fallo no bloquea la navegación.
      await runQdetectFind(activeRequest?.client || clientId);

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
