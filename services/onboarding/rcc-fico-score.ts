import { apiClient, SERVICES } from "@/sdk/dynamicore/frontend";
import { ApiResponse } from "@/types/api-response";

export const RCC_FICO_SCORE_TYPE = "rccficoscore" as const;

export interface RccFicoScorePayload {
  client_id: number;
  type: typeof RCC_FICO_SCORE_TYPE;
}

// Respuesta del endpoint /map. El backend puede devolver el valor en
// distintas formas, por eso todos los campos son opcionales y el extractor
// de abajo hace fallback entre ellos.
export interface RccFicoScoreData {
  historial_crediticio?: string | number | null;
  historial?: string | number | null;
  fico_score?: string | number | null;
  score?: string | number | null;
  valor?: string | number | null;
  value?: string | number | null;
  result?: unknown;
  data?: unknown;
  [key: string]: unknown;
}

const SCORE_TIMEOUT_MS = 60_000;

function isNonEmpty(value: unknown): value is string | number {
  if (typeof value === "number") return Number.isFinite(value);
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeScoreValue(value: unknown): string | null {
  if (isNonEmpty(value)) return String(value).trim();
  return null;
}

/**
 * Extrae el valor de historial crediticio de una respuesta con forma
 * desconocida. Prioriza keys conocidas y como último recurso recorre el
 * objeto buscando la primera key que contenga "historial", "fico" o "score"
 * con un valor string/number no vacío.
 */
export function extractHistorialCrediticio(
  input: unknown,
): string | null {
  if (input == null) return null;
  if (isNonEmpty(input)) return normalizeScoreValue(input);
  if (Array.isArray(input)) {
    for (const item of input) {
      const found = extractHistorialCrediticio(item);
      if (found) return found;
    }
    return null;
  }
  if (typeof input !== "object") return null;

  const record = input as Record<string, unknown>;

  const priorityKeys = [
    "historial_crediticio",
    "historial",
    "fico_score",
    "score",
    "valor",
    "value",
  ];
  for (const key of priorityKeys) {
    const direct = normalizeScoreValue(record[key]);
    if (direct) return direct;
  }

  // Algunas respuestas anidan el resultado en `data` o `result`.
  for (const nestKey of ["data", "result", "response", "payload"]) {
    if (nestKey in record) {
      const nested = extractHistorialCrediticio(record[nestKey]);
      if (nested) return nested;
    }
  }

  // Último recurso: cualquier key que mencione historial/fico/score.
  for (const [key, value] of Object.entries(record)) {
    const lowered = key.toLowerCase();
    if (
      lowered.includes("historial") ||
      lowered.includes("fico") ||
      lowered.includes("score")
    ) {
      const found = extractHistorialCrediticio(value);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Consulta el historial crediticio vía RCC FICO Score.
 * POST /marketplace/apps/cc/rccficoscore/map { client_id, type: "rccficoscore" }
 *
 * Devuelve el valor como string o null si no se pudo obtener.
 * Nunca lanza para no bloquear el onboarding: ante cualquier error
 * hace warn y retorna null para que el caller continúe el flujo.
 */
export async function fetchRccFicoScore(
  clientId: number | string,
): Promise<string | null> {
  const resolvedClientId = Number(clientId);
  if (!Number.isFinite(resolvedClientId) || resolvedClientId <= 0) {
    console.warn(
      "[rcc-fico-score] client_id inválido, se omite la consulta:",
      clientId,
    );
    return null;
  }

  try {
    const payload: RccFicoScorePayload = {
      client_id: resolvedClientId,
      type: RCC_FICO_SCORE_TYPE,
    };

    const { data: response } = await apiClient.post<
      ApiResponse<RccFicoScoreData | string | number | null>
    >(SERVICES.RCC_FICO_SCORE, payload, { timeout: SCORE_TIMEOUT_MS });

    return extractHistorialCrediticio(response?.data);
  } catch (error) {
    console.warn(
      "[rcc-fico-score] no se pudo obtener el historial crediticio:",
      error,
    );
    return null;
  }
}

/**
 * Resuelve el historial crediticio a enviar al pii:
 * 1. Si el profile (whitelist) ya trae valor, lo usa tal cual.
 * 2. Si no, consulta RCC FICO Score con el client_id y usa ese valor.
 * 3. Si tampoco hay valor ahí, retorna null para no bloquear el flujo.
 */
export async function resolveHistorialCrediticio(
  profileValue: string | null | undefined,
  clientId: number | string | null | undefined,
): Promise<string | null> {
  const normalizedProfile =
    typeof profileValue === "string" && profileValue.trim().length > 0
      ? profileValue.trim()
      : null;
  if (normalizedProfile) return normalizedProfile;

  if (clientId == null || String(clientId).trim() === "") return null;
  return fetchRccFicoScore(clientId);
}
