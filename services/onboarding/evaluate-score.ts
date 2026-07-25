import { apiClient, SERVICES } from "@/api/dynamicore/frontend";
import { ApiResponse } from "@/types/api-response";

export interface EvaluateScorePayload {
  action: "evaluate";
  employer_id: string;
  employee_key: string;
  monto_solicitado: number;
  plazo_meses: number;
  periodicidad: string;
}

export interface EvaluateScoreResponse {
  perfil: string;
  historial_crediticio_usado: string | null;
  score_consolidado: number;
  score_ajustado: number;
  probabilidad_rotacion_promedio: number;
  sueldo_neto_mensual: number;
  capacidad_endeudamiento_max: number;
  tasa_mensual_sin_iva: string;
  seguro_vida_al_millar: number;
  seguro_invalidez_al_millar: number;
  comision_apertura: number;
  pago_por_periodo_sin_seguros: number;
  pago_por_periodo_con_seguros_iva: number;
  numero_de_periodos: number;
  monto_total_a_pagar: number;
  tabla_amortizacion: unknown;
  evaluation_id: string;
}

export async function evaluateScore(
  payload: EvaluateScorePayload,
): Promise<EvaluateScoreResponse | null> {
  const result = await apiClient.post(SERVICES.WECOME_SCORE, payload);
  const response = result.data as ApiResponse<EvaluateScoreResponse>;

  return response?.data ?? null;
}
