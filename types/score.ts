import type { AmortizacionRow } from "./client-request";

export interface CreditConfiguration {
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
  producto: number;
}

export interface AmortizacionHeader {
  name: string;
  label: string;
  type?: "date" | "number";
  money?: string;
  format?: "currency";
}

export interface AmortizacionProperties {
  total: number;
  interest: number;
  commision: number;
  principal: number;
  ultima_fecha: string;
  interest_rate: number;
  iva_commision: number | null;
  principal_expected_sum: number;
  interest_tax_expected_sum: number | null;
  amount_commission_opening_with_iva: number;
}

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
  monto_total_a_pagar_con_seguros: number;
  configuracion_credito: CreditConfiguration;
  tabla_amortizacion: AmortizacionRow[];
  tabla_amortizacion_headers: AmortizacionHeader[];
  tabla_amortizacion_properties: AmortizacionProperties;
  motor_tabla_amortizacion: string;
  evaluation_id: string;
}
