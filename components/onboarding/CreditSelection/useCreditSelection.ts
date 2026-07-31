"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { updateActiveRequestData } from "@/services/client-requests";
import { evaluateScore } from "@/services/onboarding/evaluate-score";
import { useClientRequestStore, useClientDataStore } from "@/stores";
import { formatMoney, normalizePaymentFrequency } from "@/utils/formatters";
import { normalizeCreditType } from "@/utils/credit-type";
import {
  TERMS,
  MIN_AMOUNT,
  MAX_AMOUNT_CAP,
  PAYMENT_FREQUENCIES,
  type PaymentFrequency,
  type CreditType,
  calcularSueldoNeto,
  toPositiveNumber,
  calculateMaxCreditHeuristic,
  clampAmount,
  roundUpToThousand,
  parseFormattedAmount,
  frequencyToApiCode,
} from "./credit-math";
import { useMaxCreditEstimate } from "./useMaxCreditEstimate";

export { TERMS, MIN_AMOUNT, MAX_AMOUNT_CAP, PAYMENT_FREQUENCIES };
export type { PaymentFrequency, CreditType };

export function useCreditSelection() {
  const router = useRouter();
  const activeRequest = useClientRequestStore((state) =>
    state.getActiveRequest(),
  );
  const requestData = activeRequest?.data ?? {};

  const { client } = useClientDataStore();

  // calculamos el neto real a partir del bruto con la fórmula verificada
  const salaryBruto = toPositiveNumber(client?.pii?.sueldo_bruto) ?? 0;
  const salary = useMemo(() => calcularSueldoNeto(salaryBruto), [salaryBruto]);

  // Resolvemos los valores iniciales de requestData ANTES de crear el estado,
  // para poder usarlos como lazy initializer. Esto evita que term/paymentFrequency
  // arranquen en un default (12, QUINCENAL) y luego "salten" al valor real vía
  // setState — ese salto era justo lo que disparaba la sonda dos veces (una con
  // el default, otra con el valor correcto) además del duplicado de Strict Mode.
  const resolvedTerm = (() => {
    const parsed = Number(requestData.plazo_solicitado);
    return TERMS.includes(parsed as (typeof TERMS)[number]) ? parsed : TERMS[0];
  })();
  const resolvedType =
    normalizeCreditType(requestData.tipo_de_credito_solicitado) ?? "protected";
  const resolvedPaymentFrequency = normalizePaymentFrequency(
    requestData.frecuencia_de_pago_solicitada,
  );

  const [term, setTerm] = useState<number>(() => resolvedTerm);
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>(
    () => resolvedPaymentFrequency,
  );

  const salaryBrutoNum = toPositiveNumber(salaryBruto) ?? 0; // para mostrar en pantalla
  const salaryNetoNum = toPositiveNumber(salary) ?? 0; // para el cálculo de crédito

  const minAmount = MIN_AMOUNT;

  // Fallback heurístico local: se calcula al instante, sin red.
  const maxFromSalary = useMemo(
    () => calculateMaxCreditHeuristic(salaryNetoNum, term, 0.33),
    [salaryNetoNum, term],
  );

  // Evaluación "sonda" en backend para conocer la capacidad_endeudamiento_max real.
  // Solo depende de term (salario no cambia en la sesión, paymentFrequency no
  // afecta este cálculo). Se cachea por plazo dentro del hook: cambiar de tab
  // hacia atrás y hacia adelante no vuelve a golpear el backend.
  const {
    scoreResult,
    isEvaluating,
    hasError: hasMaxAmountError,
    retry: retryMaxAmountEstimate,
  } = useMaxCreditEstimate({
    employerId: client?.id,
    employeeKey: client?.pii?.rfc,
    term,
  });

  const maxFromScore = scoreResult?.capacidad_endeudamiento_max ?? null;

  // true cuando NO tenemos el valor real del backend todavía (cargando,
  // falló, o aún no hay client disponible) y por lo tanto maxAmount viene
  // del heurístico local — la UI puede usar esto para marcarlo como "estimado".
  const isMaxAmountEstimated = maxFromScore === null;

  // Prioriza el valor real del backend; cae al heurístico mientras carga o si falla.
  // Redondeamos hacia arriba al millar más cercano (31597.07 -> 32000) para
  // que el máximo mostrado en el slider/label sea un número limpio.
  const maxAmount = useMemo(() => {
    const base = maxFromScore ?? maxFromSalary;
    const rounded = roundUpToThousand(base);
    return Math.min(MAX_AMOUNT_CAP, Math.max(MIN_AMOUNT, rounded));
  }, [maxFromScore, maxFromSalary]);

  const [amount, setAmount] = useState(MIN_AMOUNT);
  const [amountInput, setAmountInput] = useState(formatMoney(MIN_AMOUNT));
  const [hasInsurance, setHasInsurance] = useState<CreditType>("protected");
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Sincroniza el texto del input cuando `amount` cambia (por slider, clamp, etc.)
  useEffect(() => {
    setAmountInput(formatMoney(amount));
  }, [amount]);

  // Clamp amount si cambia el rango (p. ej. al cambiar el plazo o llegar maxFromScore)
  useEffect(() => {
    setAmount((prev) => clampAmount(prev, minAmount, maxAmount));
  }, [minAmount, maxAmount]);

  // amount sí depende de maxAmount (que a su vez depende de la sonda), así que
  // este uno sigue necesitando un useEffect: no podemos conocer el maxAmount
  // real en el primer render. hasInsurance no depende de nada async, pero lo
  // dejamos aquí junto a amount por venir de la misma fuente (requestData).
  //
  // Si ya había un monto elegido antes (requestData), lo respetamos (y el
  // clamp de abajo lo ajusta si el maxAmount real terminó siendo menor).
  // Si NO había nada elegido, arrancamos en minAmount — a diferencia de
  // maxAmount, minAmount es la constante MIN_AMOUNT y nunca cambia, así
  // que es un default estable y predecible (maxAmount/2 podía variar según
  // si el heurístico o el score ya habían resuelto en ese momento).
  const requestedAmount = toPositiveNumber(requestData.monto_solicitado);
  const resolvedAmount = clampAmount(
    requestedAmount ?? minAmount,
    minAmount,
    maxAmount,
  );
  useEffect(() => {
    setAmount(resolvedAmount);
    setHasInsurance(resolvedType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bloquea scroll del body cuando el modal de riesgo está abierto
  useEffect(() => {
    document.body.style.overflow = showRiskModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showRiskModal]);

  const pct = useMemo(() => {
    if (maxAmount === minAmount) return 100;
    return ((amount - minAmount) / (maxAmount - minAmount)) * 100;
  }, [amount, minAmount, maxAmount]);

  const handleAmountChange = useCallback(
    (value: number) => {
      if (Number.isNaN(value)) return;
      setAmount(clampAmount(value, minAmount, maxAmount));
    },
    [minAmount, maxAmount],
  );

  // Mientras escribe: solo filtramos caracteres inválidos, NO clampamos todavía
  const handleAmountInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const filtered = e.target.value.replace(/[^\d\s,]/g, "");
      setAmountInput(filtered);
    },
    [],
  );

  // Al salir del campo (o Enter): ahí sí clampamos y sincronizamos con el slider
  const handleAmountInputBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const parsed = parseFormattedAmount(e.target.value);
      if (parsed !== null) {
        handleAmountChange(parsed);
      } else {
        setAmountInput(formatMoney(amount));
      }
    },
    [amount, handleAmountChange],
  );

  const handleAmountInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.currentTarget.blur();
      }
    },
    [],
  );

  const handleInsuranceClick = useCallback((value: boolean) => {
    if (!value) {
      setShowRiskModal(true);
    } else {
      setShowRiskModal(false);
      setHasInsurance("protected");
    }
  }, []);

  const handleRiskAccept = useCallback(() => {
    setHasInsurance("esencial");
    setShowRiskModal(false);
  }, []);

  const handleRiskCancel = useCallback(() => {
    setShowRiskModal(false);
  }, []);

  const handleContinue = useCallback(async () => {
    const nextStep = ROUTES.ONBOARDING.CREDIT_RESULT;
    setIsSubmitting(true);
    setError("");
    try {
      const result = await evaluateScore({
        action: "evaluate",
        employer_id: String(client?.id ?? ""),
        employee_key: client?.pii?.rfc ?? "",
        monto_solicitado: amount,
        plazo_meses: term,
        periodicidad: paymentFrequency,
      });

      if (!result) {
        throw new Error("No se pudo obtener el resultado de la evaluación.");
      }

      await updateActiveRequestData({
        monto_solicitado: amount,
        sueldo_bruto_mensual: salary,
        tipo_de_credito_solicitado:
          hasInsurance === "protected" ? "protected" : "esencial",
        plazo_solicitado: term,
        frecuencia_de_pago_solicitada: frequencyToApiCode(paymentFrequency),
        paso_actual: nextStep,

        perfil: result.perfil,
        historial_crediticio_usado: result.historial_crediticio_usado ?? "",
        score_consolidado: String(result.score_consolidado),
        score_ajustado: String(result.score_ajustado),
        probabilidad_rotacion_promedio: String(
          result.probabilidad_rotacion_promedio,
        ),
        sueldo_neto_mensual: result.sueldo_neto_mensual,
        capacidad_endeudamiento_max: result.capacidad_endeudamiento_max,
        tasa_mensual_sin_iva: parseFloat(result.tasa_mensual_sin_iva),
        seguro_vida: result.seguro_vida_al_millar,
        seguro_invalidez_total_permanente: result.seguro_invalidez_al_millar,
        comision_apertura: result.comision_apertura,
        pago_por_periodo_sin_seguros: result.pago_por_periodo_sin_seguros,
        pago_por_periodo_con_seguros_iva:
          result.pago_por_periodo_con_seguros_iva,
        numero_de_periodos: result.numero_de_periodos,
        monto_total_a_pagar: result.monto_total_a_pagar,
        evaluation_id: result.evaluation_id,
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
  }, [
    amount,
    term,
    paymentFrequency,
    client?.id,
    client?.pii?.rfc,
    salary,
    hasInsurance,
    router,
  ]);

  return {
    // datos de referencia
    salaryBrutoNum,
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
    isEvaluating,
    isMaxAmountEstimated,
    hasMaxAmountError,
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
    retryMaxAmountEstimate,

    // navegación
    router,
  };
}
