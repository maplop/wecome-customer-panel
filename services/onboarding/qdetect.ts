import { apiClient, SERVICES } from "@/sdk/dynamicore/frontend";
import { ApiResponse } from "@/types/api-response";

export const QDETECT_FIND_TYPE = "qdetect_find" as const;

export interface QdetectFindPayload {
  client: string;
  type: typeof QDETECT_FIND_TYPE;
}

export type QdetectFindResult = Record<string, unknown>;

// La consulta puede tardar; el apiClient global usa un timeout de 10s,
// así que lo extendemos aquí igual que en el resto de consultas pesadas.
const QDETECT_TIMEOUT_MS = 60_000;

/**
 * Ejecuta la consulta Qdetect para un cliente.
 * POST /internal/connector/22/flows/911006141aab4b13b1164dfe3b807a80
 * { client: "<client_id>", type: "qdetect_find" }
 *
 * Nunca lanza para no bloquear el onboarding: ante cualquier error hace warn
 * y retorna null, de modo que el flujo pueda continuar.
 */
export async function runQdetectFind(
  clientId: number | string | null | undefined,
): Promise<QdetectFindResult | null> {
  const resolvedClientId = String(clientId ?? "").trim();
  const numericClientId = Number(resolvedClientId);

  if (!resolvedClientId || !Number.isFinite(numericClientId) || numericClientId <= 0) {
    console.warn(
      "[qdetect] client_id inválido, se omite la consulta:",
      clientId,
    );
    return null;
  }

  try {
    const payload: QdetectFindPayload = {
      client: resolvedClientId,
      type: QDETECT_FIND_TYPE,
    };

    const { data: response } = await apiClient.post<
      ApiResponse<QdetectFindResult>
    >(SERVICES.QDETECT_FIND, payload, { timeout: QDETECT_TIMEOUT_MS });

    return response?.data ?? null;
  } catch (error) {
    console.warn("[qdetect] no se pudo completar la consulta:", error);
    return null;
  }
}
