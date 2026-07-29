'use client'
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { updateActiveRequestData } from "@/services/client-requests";
import { evaluateScore } from "@/services/onboarding/evaluate-score";
import { useClientRequestStore, useClientDataStore } from "@/stores";
import { formatMoney, normalizePaymentFrequency } from "@/utils/formatters";
import { normalizeCreditType } from "@/utils/credit-type";

export const TERMS = [12, 24] as const;
export const MIN_AMOUNT = 10000;
export const MAX_AMOUNT_CAP = 250000;
export const PAYMENT_FREQUENCIES = ["SEMANAL", "QUINCENAL", "MENSUAL"] as const;

export type PaymentFrequency = (typeof PAYMENT_FREQUENCIES)[number];
export type CreditType = "protected" | "esencial";

function toPositiveNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function calculateMaxCredit(
  monthlySalary: number,
  term: number,
  monthlyRate: number = 0.04,
  debtCapacity: number = 0.33,
) {
  // capacidad máxima de pago mensual
  const maxPayment = monthlySalary * debtCapacity;

  // fórmula valor presente de una anualidad
  const maxCredit =
    maxPayment * ((1 - Math.pow(1 + monthlyRate, -term)) / monthlyRate);

  return Math.round(maxCredit);
}

export function useCreditSelection() {
  const router = useRouter();
  const activeRequest = useClientRequestStore((state) =>
    state.getActiveRequest(),
  );
  const requestData = activeRequest?.data ?? {};

  const { client } = useClientDataStore();
  const salary = client?.pii?.sueldo_bruto ?? 0;

  // 1️⃣ term primero porque maxAmount depende de él
  const resolvedTerm = (() => {
    const parsed = Number(requestData.plazo_solicitado);
    return TERMS.includes(parsed as (typeof TERMS)[number]) ? parsed : TERMS[0];
  })();

  const [term, setTerm] = useState<number>(resolvedTerm);

  const resolvedPaymentFrequency = normalizePaymentFrequency(
    requestData.frecuencia_de_pago_solicitada,
  );
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>(
    resolvedPaymentFrequency,
  );

  // 2️⃣ maxAmount depende de term
  const salaryNum = toPositiveNumber(salary) ?? 0;
  const minAmount = MIN_AMOUNT;
  const maxFromSalary = calculateMaxCredit(
    salaryNum,
    term,
    0.04, // tasa mensual con IVA
    0.33, // capacidad endeudamiento
  );

  const maxAmount = Math.min(
    MAX_AMOUNT_CAP,
    Math.max(MIN_AMOUNT, maxFromSalary),
  );

  // 3️⃣ resolvedAmount depende de maxAmount
  const resolvedType =
    normalizeCreditType(requestData.tipo_de_credito_solicitado) ?? "protected";
  const requestedAmount = toPositiveNumber(requestData.monto_solicitado);
  const resolvedAmount = Math.min(
    maxAmount,
    Math.max(minAmount, Math.round(requestedAmount ?? maxAmount / 2)),
  );

  const [amount, setAmount] = useState(resolvedAmount);
  const [amountInput, setAmountInput] = useState(formatMoney(resolvedAmount));
  const [hasInsurance, setHasInsurance] = useState<CreditType>(resolvedType);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Sincroniza el texto del input cuando `amount` cambia (por slider, clamp, etc.)
  useEffect(() => {
    setAmountInput(formatMoney(amount));
  }, [amount]);

  // Clamp amount si cambia el rango (p. ej. al cambiar el plazo)
  useEffect(() => {
    setAmount((prev) => Math.max(minAmount, Math.min(prev, maxAmount)));
  }, [minAmount, maxAmount]);

  // Inicialización desde requestData (solo al montar)
  useEffect(() => {
    setAmount(resolvedAmount);
    setTerm(resolvedTerm);
    setHasInsurance(resolvedType);
    setPaymentFrequency(resolvedPaymentFrequency);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bloquea scroll del body cuando el modal de riesgo está abierto
  useEffect(() => {
    document.body.style.overflow = showRiskModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showRiskModal]);

  const pct =
    maxAmount === minAmount
      ? 100
      : ((amount - minAmount) / (maxAmount - minAmount)) * 100;

  const handleAmountChange = (value: number) => {
    if (Number.isNaN(value)) return;
    const clamped = Math.max(minAmount, Math.min(maxAmount, Math.round(value)));
    setAmount(clamped);
  };

  const parseFormattedAmount = (text: string): number | null => {
    const cleaned = text.replace(/[\s,]/g, "");
    if (cleaned === "") return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  };

  // Mientras escribe: solo filtramos caracteres inválidos, NO clampamos todavía
  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filtered = e.target.value.replace(/[^\d\s,]/g, "");
    setAmountInput(filtered);
  };

  // Al salir del campo (o Enter): ahí sí clampamos y sincronizamos con el slider
  const handleAmountInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const parsed = parseFormattedAmount(e.target.value);
    if (parsed !== null) {
      handleAmountChange(parsed);
    } else {
      setAmountInput(formatMoney(amount));
    }
  };

  const handleAmountInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  const handleInsuranceClick = (value: boolean) => {
    if (!value) {
      setShowRiskModal(true);
    } else {
      setShowRiskModal(false);
      setHasInsurance("protected");
    }
  };

  const handleRiskAccept = () => {
    setHasInsurance("esencial");
    setShowRiskModal(false);
  };

  const handleRiskCancel = () => {
    setShowRiskModal(false);
  };

  const handleContinue = async () => {
    const nextStep = ROUTES.ONBOARDING.CREDIT_RESULT;
    setIsSubmitting(true);
    setError("");
    try {
      const scoreResult = await evaluateScore({
        action: "evaluate",
        employer_id: String(client?.id ?? ""),
        employee_key: client?.pii?.rfc ?? "",
        monto_solicitado: amount,
        plazo_meses: term,
        periodicidad: paymentFrequency,
      });

      if (!scoreResult) {
        throw new Error("No se pudo obtener el resultado de la evaluación.");
      }

      await updateActiveRequestData({
        monto_solicitado: amount,
        sueldo_bruto_mensual: salary,
        tipo_de_credito_solicitado:
          hasInsurance === "protected" ? "protected" : "esencial",
        plazo_solicitado: term,
        frecuencia_de_pago_solicitada:
          paymentFrequency === "SEMANAL"
            ? 3
            : paymentFrequency === "QUINCENAL"
              ? 1
              : 2,
        paso_actual: nextStep,

        perfil: scoreResult.perfil,
        historial_crediticio_usado:
          scoreResult.historial_crediticio_usado ?? "",
        score_consolidado: String(scoreResult.score_consolidado),
        score_ajustado: String(scoreResult.score_ajustado),
        probabilidad_rotacion_promedio: String(
          scoreResult.probabilidad_rotacion_promedio,
        ),
        sueldo_neto_mensual: scoreResult.sueldo_neto_mensual,
        capacidad_endeudamiento_max: scoreResult.capacidad_endeudamiento_max,
        tasa_mensual_sin_iva: parseFloat(scoreResult.tasa_mensual_sin_iva),
        seguro_vida: scoreResult.seguro_vida_al_millar,
        seguro_invalidez_total_permanente:
          scoreResult.seguro_invalidez_al_millar,
        comision_apertura: scoreResult.comision_apertura,
        pago_por_periodo_sin_seguros: scoreResult.pago_por_periodo_sin_seguros,
        pago_por_periodo_con_seguros_iva:
          scoreResult.pago_por_periodo_con_seguros_iva,
        numero_de_periodos: scoreResult.numero_de_periodos,
        monto_total_a_pagar: scoreResult.monto_total_a_pagar,
        evaluation_id: scoreResult.evaluation_id,
      });

      router.push(nextStep);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo completar la evaluación. Intenta nuevamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // datos de referencia
    salaryNum,
    minAmount,
    maxAmount,
    pct,

    // estado
    term,
    paymentFrequency,
    amount,
    amountInput,
    hasInsurance,
    showRiskModal,
    isSubmitting,
    error,

    // setters directos usados en la UI
    setTerm,
    setPaymentFrequency,

    // handlers
    handleAmountChange,
    handleAmountInputChange,
    handleAmountInputBlur,
    handleAmountInputKeyDown,
    handleInsuranceClick,
    handleRiskAccept,
    handleRiskCancel,
    handleContinue,

    // navegación
    router,
  };
}
