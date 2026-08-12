import { useCallback, useEffect, useRef, useState } from "react";
import { evaluateScore } from "@/services/onboarding/evaluate-score";
import type { EvaluateScoreResponse } from "@/types/score";
import type { PaymentFrequency } from "./credit-math";

// Monto y frecuencia fijos, usados solo para "sondear" la capacidad_endeudamiento_max
// real. Ninguno de los dos afecta ese valor (solo importan salario y plazo), así que
// se dejan constantes: esto hace que el resultado sea cacheable únicamente por plazo.
const PROBE_AMOUNT = 10000;
const PROBE_FREQUENCY: PaymentFrequency = "QUINCENAL";

interface UseMaxCreditEstimateParams {
  employerId: string | number | null | undefined;
  employeeKey: string | null | undefined;
  term: number;
}

interface UseMaxCreditEstimateResult {
  scoreResult: EvaluateScoreResponse | null;
  isEvaluating: boolean;
  /** true si el último intento para el plazo actual falló (no si simplemente aún no se ha intentado). */
  hasError: boolean;
  /** Reintenta la sonda para el plazo actual, ignorando que ya haya fallado antes. */
  retry: () => void;
}

/**
 * Obtiene (y cachea) la capacidad_endeudamiento_max real para el plazo actual.
 *
 * Como solo hay dos plazos posibles (TERMS = [12, 24]) y el salario no cambia
 * durante la sesión, el resultado de cada plazo se pide UNA sola vez y se
 * reutiliza el resto de la sesión.
 *
 * `paymentFrequency` deliberadamente NO es un parámetro: no afecta este
 * cálculo, así que cambiarla nunca dispara una nueva sonda.
 *
 * Fallback ante fallas: si la petición falla, `scoreResult` se queda en
 * `null` (nunca se cachea un error) para que el caller use su heurístico
 * local. `hasError` se pone en `true` solo para ese caso específico, así
 * el caller puede distinguir "todavía no hay dato" (p.ej. cargando por
 * primera vez) de "lo intentamos y falló" — y ofrecer un botón de retry.
 * Cambiar de plazo y volver reintenta automáticamente (los fallos no se
 * cachean); `retry()` permite forzarlo sin cambiar de plazo.
 */
export function useMaxCreditEstimate({
  employerId,
  employeeKey,
  term,
}: UseMaxCreditEstimateParams): UseMaxCreditEstimateResult {
  // Resultados ya resueltos, por plazo (máximo 2 entradas: 12 y 24).
  const cacheRef = useRef<Map<number, EvaluateScoreResponse>>(new Map());
  // Peticiones en curso, por plazo — evita duplicar la llamada si el usuario
  // vuelve al mismo plazo antes de que la primera respuesta llegue.
  const inFlightRef = useRef<
    Map<number, Promise<EvaluateScoreResponse | null>>
  >(new Map());

  const [scoreResult, setScoreResult] = useState<EvaluateScoreResponse | null>(
    () => cacheRef.current.get(term) ?? null,
  );
  const [isEvaluating, setIsEvaluating] = useState(false);
  // Plazo para el que el último intento falló (null si el plazo actual no ha fallado).
  const [failedTerm, setFailedTerm] = useState<number | null>(null);
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    if (!employerId || !employeeKey) return;

    let cancelled = false;

    const cached = cacheRef.current.get(term);
    if (cached) {
      // Ya lo teníamos de una visita anterior a este plazo: uso inmediato,
      // sin red y sin loading.
      setScoreResult(cached);
      setIsEvaluating(false);
      setFailedTerm((prev) => (prev === term ? null : prev));
      return;
    }

    // No hay dato válido para este plazo todavía: no mostrar el de otro plazo
    // mientras carga (el caller cae a su heurístico local mientras tanto).
    setScoreResult(null);
    setIsEvaluating(true);
    setFailedTerm((prev) => (prev === term ? null : prev)); // intento nuevo: limpia el error previo

    let request = inFlightRef.current.get(term);
    if (!request) {
      request = evaluateScore({
        action: "evaluate",
        employer_id: String(employerId),
        employee_key: employeeKey,
        monto_solicitado: PROBE_AMOUNT,
        plazo_meses: term,
        periodicidad: PROBE_FREQUENCY,
      });
      inFlightRef.current.set(term, request);
    }

    request
      .then((result) => {
        if (result) {
          cacheRef.current.set(term, result);
          if (!cancelled) setScoreResult(result);
        } else if (!cancelled) {
          // Respuesta vacía/nula: la tratamos igual que una falla para efectos de UI.
          setFailedTerm(term);
        }
      })
      .catch(() => {
        if (!cancelled) setFailedTerm(term);
        // El caller usa su fallback heurístico local; no hay más que hacer aquí.
      })
      .finally(() => {
        inFlightRef.current.delete(term);
        if (!cancelled) setIsEvaluating(false);
      });

    return () => {
      cancelled = true;
    };
    // retryTick fuerza re-ejecutar el efecto sin que term/employerId/employeeKey cambien
  }, [employerId, employeeKey, term, retryTick]);

  const retry = useCallback(() => {
    setRetryTick((t) => t + 1);
  }, []);

  return {
    scoreResult,
    isEvaluating,
    hasError: failedTerm === term,
    retry,
  };
}
