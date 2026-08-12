import { apiClient, SERVICES } from "@/sdk/dynamicore/frontend";
import { ApiResponse } from "@/types/api-response";
import type {
  CalculateScorePayload,
  EvaluateScorePayload,
  EvaluateScoreResponse,
} from "@/types/score";

export async function evaluateScore(
  payload: EvaluateScorePayload,
): Promise<EvaluateScoreResponse | null> {
  const result = await apiClient.post(SERVICES.WECOME_SCORE, payload);
  const response = result.data as ApiResponse<EvaluateScoreResponse>;

  return response?.data ?? null;
}

export async function calculateScore(
  payload: CalculateScorePayload,
): Promise<EvaluateScoreResponse | null> {
  const result = await apiClient.post(SERVICES.WECOME_SCORE, payload);
  const response = result.data as ApiResponse<EvaluateScoreResponse>;

  return response?.data ?? null;
}
