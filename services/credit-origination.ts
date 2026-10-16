import { apiClient, SERVICES } from "@/sdk/dynamicore/frontend";
import type { ApiResponse } from "@/types/api-response";
import type { ClientRequestRecord } from "@/types/client-request";
import type { EvaluateScoreResponse } from "@/types/score";

export interface OriginateCreditPayload {
  client: number;
  amount: number;
  numero_cuotas: number;
  periodicidad: string;
  tasa_interes_anual_pct: number;
  base_interes: string;
  tasa_interes_moratoria_bps: number;
  comision_apertura_pct: number;
  seguro_vida_e_invalidez_al_millar: {
    vida: number;
    invalidez: number;
  };
  comision_apertura: number;
  primer_pago_amortizacion: string;
  fecha_desembolso: string;
}

export interface OriginateCreditInput {
  credit: ClientRequestRecord;
  scoreData: EvaluateScoreResponse | null;
  amount?: number;
}

type ResponseRecord = Record<string, unknown>;

export interface OriginatedCredit extends Record<string, unknown> {
  id: number;
  product?: number | string;
  product_id?: number | string;
}

export function resolveOriginatedProductId(
  originated: OriginatedCredit,
): number {
  // product_id = id del crédito recién creado (ej. 159341).
  // Sin fallback: si no hay id válido, se lanza error.
  const num = Number(originated.id);
  if (!Number.isFinite(num) || num <= 0) {
    throw new Error(
      "No se encontró el product_id en la respuesta de originación.",
    );
  }
  return Math.trunc(num);
}

function isResponseRecord(value: unknown): value is ResponseRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pickMeaningfulMessage(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.toUpperCase() === "OK") return null;
  return value;
}

function findErrorMessage(value: unknown, depth = 0): string | null {
  if (depth > 5 || value == null) return null;

  if (typeof value === "string") {
    return pickMeaningfulMessage(value);
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findErrorMessage(item, depth + 1);
      if (found) return found;
    }
    return null;
  }

  if (!isResponseRecord(value)) return null;

  for (const key of ["message", "error", "detail", "details", "reason"]) {
    const candidate = value[key];
    if (typeof candidate === "string") {
      const message = pickMeaningfulMessage(candidate);
      if (message) return message;
    } else if (Array.isArray(candidate)) {
      const joined = candidate
        .filter((entry): entry is string => typeof entry === "string")
        .map((entry) => entry.trim())
        .filter(Boolean)
        .join(" ");
      if (joined && joined.toUpperCase() !== "OK") return joined;
      const found = findErrorMessage(candidate, depth + 1);
      if (found) return found;
    } else if (isResponseRecord(candidate)) {
      const found = findErrorMessage(candidate, depth + 1);
      if (found) return found;
    }
  }

  if ("data" in value) {
    return findErrorMessage(value.data, depth + 1);
  }

  return null;
}

function throwOriginationError(value: unknown): never {
  throw new Error(
    findErrorMessage(value) ??
      "El endpoint no confirmó que el crédito se haya originado correctamente.",
  );
}

/**
 * Extrae el crédito creado desde las formas que devuelve el flow 4317.
 * Forma actual: { code: 1, total: 1, data: [{ id, status: "pending", ... }] }
 * Forma legada: { code: 1, data: { status: "ok" }, transaction: "..." }
 */
function extractOriginatedCredit(value: unknown): OriginatedCredit | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = extractOriginatedCredit(item);
      if (found) return found;
    }
    return null;
  }

  if (!isResponseRecord(value)) return null;

  // Registro directo de crédito: { id: 159319, status: "pending", ... }
  // Se acepta "pending" porque significa que el crédito sí se creó.
  if (toPositiveInt(value.id) != null) {
    return value as OriginatedCredit;
  }

  // Contenedor { code: 1, data: [...] | {...} }
  if (value.code === 1 && "data" in value) {
    const inner = (value as { data?: unknown }).data;

    if (Array.isArray(inner)) {
      return extractOriginatedCredit(inner);
    }

    if (isResponseRecord(inner)) {
      // Legado: { code: 1, data: { status: "ok" }, transaction: "..." }
      if (
        inner.status === "ok" &&
        typeof value.transaction === "string" &&
        value.transaction.trim()
      ) {
        return value as unknown as OriginatedCredit;
      }

      const nested = extractOriginatedCredit(inner);
      if (nested) return nested;
    }
  }

  return null;
}

function toPositiveInt(value: unknown): number | null {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return null;
  return Math.trunc(num);
}

function toFiniteNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return null;
  return num;
}

function toPositiveNumber(value: unknown): number | null {
  const num = toFiniteNumber(value);
  return num != null && num > 0 ? num : null;
}

function formatLocalDateTime(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;
}

function resolveFirstPaymentDate(scoreData: EvaluateScoreResponse): string {
  const rawDate = scoreData.tabla_amortizacion?.[0]?.date?.trim();
  if (!rawDate) {
    throw new Error("No se encontró la primera fecha de amortización.");
  }

  // Las fechas sin zona horaria representan la fecha local del calendario.
  const dateValue = /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
    ? `${rawDate}T00:00:00`
    : rawDate;
  const date = new Date(dateValue);
  if (!Number.isFinite(date.getTime())) {
    throw new Error("La primera fecha de amortización no es válida.");
  }

  return date.toISOString();
}

export function buildOriginateCreditPayload(
  input: OriginateCreditInput,
): OriginateCreditPayload {
  console.log("buildOriginateCreditPayload input:", input);
  const { credit, scoreData } = input;
  const data = credit.data ?? {};

  if (!scoreData) {
    throw new Error("No se pudo obtener la configuración del crédito.");
  }

  const client = toPositiveInt(credit.client);
  if (!client) {
    throw new Error("No se encontró el cliente de la solicitud.");
  }

  const configuration = scoreData.configuracion_credito;
  const numero_cuotas = toPositiveInt(configuration?.numero_cuotas);
  if (!numero_cuotas) {
    throw new Error("No se encontró el número de cuotas en el score.");
  }

  const amount =
    toPositiveNumber(input.amount) ??
    toPositiveNumber(data.monto_ofertado) ??
    toPositiveNumber(data.monto_solicitado);
  if (!amount) {
    throw new Error("No se encontró el monto de la oferta a aprobar.");
  }

  const periodicidadConfigurada = configuration?.periodicidad?.trim();
  const base_interes = configuration?.base_interes?.trim();
  if (!periodicidadConfigurada || !base_interes) {
    throw new Error(
      "No se encontró la periodicidad o base de interés en el score.",
    );
  }
  const periodicidad =
    periodicidadConfigurada.toUpperCase() === "QUINCENAL"
      ? "BIWEEKLY"
      : periodicidadConfigurada;

  const tasa_interes_anual_pct = toFiniteNumber(
    configuration.tasa_interes_anual_pct,
  );
  const tasa_interes_moratoria_bps = toFiniteNumber(
    configuration.tasa_interes_moratoria_bps,
  );
  const comision_apertura_pct = toFiniteNumber(
    configuration.comision_apertura_pct,
  );
  const vida = toFiniteNumber(
    configuration.seguro_vida_e_invalidez_al_millar?.vida,
  );
  const invalidez = toFiniteNumber(
    configuration.seguro_vida_e_invalidez_al_millar?.invalidez,
  );
  const comision_apertura = toFiniteNumber(scoreData.comision_apertura);
  const primer_pago_amortizacion = resolveFirstPaymentDate(scoreData);

  if (
    tasa_interes_anual_pct == null ||
    tasa_interes_moratoria_bps == null ||
    comision_apertura_pct == null ||
    vida == null ||
    invalidez == null ||
    comision_apertura == null
  ) {
    throw new Error("Faltan condiciones del crédito en el score.");
  }

  return {
    client,
    amount,
    numero_cuotas,
    periodicidad,
    tasa_interes_anual_pct,
    base_interes,
    tasa_interes_moratoria_bps,
    comision_apertura_pct,
    seguro_vida_e_invalidez_al_millar: { vida, invalidez },
    comision_apertura,
    primer_pago_amortizacion,
    fecha_desembolso: formatLocalDateTime(new Date()),
  };
}

export async function originateCredit(
  payload: OriginateCreditPayload,
): Promise<OriginatedCredit> {
  const { data: response } = await apiClient.post<ApiResponse<unknown>>(
    SERVICES.CREDIT_ORIGINATION,
    payload,
  );

  if (response?.code !== 200 || response.status !== "success") {
    throwOriginationError(response);
  }

  const flowResponse = response.data;
  if (!isResponseRecord(flowResponse) || flowResponse.code !== 200) {
    throwOriginationError(flowResponse);
  }

  const firstResult = flowResponse.data;
  if (!isResponseRecord(firstResult) || firstResult.code !== 1) {
    throwOriginationError(firstResult);
  }

  const originated = extractOriginatedCredit(firstResult);
  if (!originated) {
    throwOriginationError(firstResult);
  }

  return originated;
}
