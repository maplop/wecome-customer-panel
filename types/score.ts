import type { AmortizacionRow } from "./client-request";

export interface EvaluateScorePayload {
  action: "evaluate";
  employer_id: string;
  employee_key: string;
  monto_solicitado: number;
  plazo_meses: number;
  periodicidad: string;
}

export interface CalculateScorePayload {
  action: "calculate";
  evaluation_id: string;
  monto_solicitado: number;
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
  monto_total_a_pagar_con_seguros?: number;
  tabla_amortizacion: AmortizacionRow[];
  evaluation_id: string;
}
