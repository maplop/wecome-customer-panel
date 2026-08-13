import { apiClient, SERVICES } from "@/sdk/dynamicore/frontend";
import { ApiResponse } from "@/types/api-response";
import type {
  CalculateScorePayload,
  EvaluateScorePayload,
  EvaluateScoreResponse,
} from "@/types/score";

// La evaluación de score es lenta en backend; el apiClient global usa un
// timeout de 10s, así que lo extendemos aquí para evitar que se cancele.
const SCORE_TIMEOUT_MS = 120_000;

export async function evaluateScore(
  payload: EvaluateScorePayload,
): Promise<EvaluateScoreResponse | null> {
  const result = await apiClient.post(SERVICES.WECOME_SCORE, payload, {
    timeout: SCORE_TIMEOUT_MS,
  });
  const response = result.data as ApiResponse<EvaluateScoreResponse>;

  return response?.data ?? null;
}

export async function calculateScore(
  payload: CalculateScorePayload,
): Promise<EvaluateScoreResponse | null> {
  const result = await apiClient.post(SERVICES.WECOME_SCORE, payload, {
    timeout: SCORE_TIMEOUT_MS,
  });
  const response = result.data as ApiResponse<EvaluateScoreResponse>;

  return response?.data ?? null;
}
