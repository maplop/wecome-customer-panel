// Constantes y funciones puras del dominio "selección de crédito".
// Sin dependencias de React: fáciles de testear de forma aislada.

export const TERMS = [6, 12] as const;
export const MIN_AMOUNT = 10000;
export const MAX_AMOUNT_CAP = 250000;
export const PAYMENT_FREQUENCIES = ["SEMANAL", "QUINCENAL", "MENSUAL"] as const;
export const AMOUNT_STEP = 1000;

export type PaymentFrequency = (typeof PAYMENT_FREQUENCIES)[number];
export type CreditType = "protected" | "esencial";

// fórmula real de retención (verificada con muestra real)
const SUELDO_MINIMO_RETENCION = 8000;
const TASA_BASE = 0.05;
const TASA_INCREMENTAL_POR_MIL = 0.00472;
const MILES_EXCEDENTES_MAX = 53;

const DEFAULT_PROB_ROTACION_ESTIMADA = 0.35;
const DEFAULT_DEBT_CAPACITY = 0.33;

export function calcularSueldoNeto(sueldoBruto: number): number {
  if (sueldoBruto <= SUELDO_MINIMO_RETENCION) return sueldoBruto;

  const milesExcedentes = Math.min(
    (sueldoBruto - SUELDO_MINIMO_RETENCION) / 1000,
    MILES_EXCEDENTES_MAX,
  );

  const tasaEfectiva = TASA_BASE + TASA_INCREMENTAL_POR_MIL * milesExcedentes;
  return sueldoBruto * (1 - tasaEfectiva);
}

export function toPositiveNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Estimación LOCAL/heurística del crédito máximo, usada como fallback
 * mientras no tengamos (o falle) la respuesta real del backend
 * (capacidad_endeudamiento_max via evaluateScore).
 */
export function calculateMaxCreditHeuristic(
  monthlySalaryNeto: number,
  termMonths: number,
  debtCapacity: number = DEFAULT_DEBT_CAPACITY,
  probRotacion: number = DEFAULT_PROB_ROTACION_ESTIMADA,
): number {
  const capacidadBase = monthlySalaryNeto * debtCapacity * termMonths;

  // Perfil B por defecto
  const maxCredit = capacidadBase * (1 - probRotacion / 2);

  return Math.round(Math.max(0, maxCredit));
}

export function clampAmount(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

/**
 * Redondea hacia arriba al millar más cercano.
 * Ej: 31597.07 -> 32000, 15798.54 -> 16000, 10000 -> 10000.
 * Se usa para que el monto máximo mostrado (venga del backend real o del
 * heurístico local) siempre sea un número "redondo" y fácil de leer.
 */
export function roundUpToThousand(value: number): number {
  return Math.ceil(value / 1000) * 1000;
}

export function parseFormattedAmount(text: string): number | null {
  const cleaned = text.replace(/[\s,]/g, "");
  if (cleaned === "") return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

export function frequencyToApiCode(frequency: PaymentFrequency): 1 | 2 | 3 {
  switch (frequency) {
    case "SEMANAL":
      return 3;
    case "MENSUAL":
      return 2;
    case "QUINCENAL":
    default:
      return 1;
  }
}
