export interface ClientRequestData {
  plazo_solicitado?: number;
  plazo_ofertado?: number;
  tipo_de_credito_solicitado?: string;
  tipo_de_credito_ofertado?: string;
  monto_solicitado?: number;
  estado?: RequestStatus;
  capacidad_endeudamiento_max?: number;
  monto_ofertado?: number;
  frecuencia_de_pago_ofertada?: number;
  frecuencia_de_pago_solicitada?: number;
  paso_actual?: string;
  perfil?: string;
  score_consolidado?: string;
  score_ajustado?: string;
  probabilidad_rotacion_promedio?: string;
  sueldo_neto_mensual?: number;
  tasa_mensual_sin_iva?: number;
  seguro_vida?: number;
  seguro_invalidez_total_permanente?: number;
  historial_crediticio_usado?: string;
  comision_apertura?: number;
  pago_por_periodo_sin_seguros?: number;
  pago_por_periodo_con_seguros_iva?: number;
  numero_de_periodos?: number;
  monto_total_a_pagar?: number;
  evaluation_id?: string;
}

export type RequestStatus =
  | "pending"
  | "resolved"
  | "approved"
  | "active"
  | "completed"
  | "denied";

export interface ClientRequestRecord {
  id: string;
  form_id: number;
  client: number;
  company: number;
  data: ClientRequestData;
  enabled: string;
  created_at: string;
  updated_at: string;
}

export interface AddClientRequestInput {
  form_id: string;
  client: number;
  data?: ClientRequestData;
  enabled?: number;
}

export interface UpdateClientRequestInput {
  id: string;
  form_id: string | number;
  client: number;
  data?: ClientRequestData;
  enabled?: number;
}
