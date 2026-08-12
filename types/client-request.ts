export interface AmortizacionRow {
  periodo: number;
  pago: number;
  interes: number;
  capital: number;
  saldo: number;
}

export interface ClientRequestData {
  //autorizacion_de_consulta_de_historial_crediticio?: boolean;
  //sueldo_neto_mensual?: number;
  //sueldo_bruto_mensual?: number;
  //tasa_mensual_sin_iva?: number;
  //seguro_vida?: number;
  //seguro_invalidez_total_permanente?: number;
  //seguro_vida_al_millar?: number;
  //seguro_invalidez_al_millar?: number;
  //paso_actual?: string;
  //score_consolidado?: string;
  //score_ajustado?: string;
  //pago_por_periodo_sin_seguros?: number;
  //pago_por_periodo_con_seguros_iva?: number;
  //monto_total_a_pagar_con_seguros?: number;
  //tabla_amortizacion?: AmortizacionRow[];
  //numero_de_periodos?: number;

  estado?: RequestStatus;
  perfil?: string;
  historial_crediticio_usado?: string;
  probabilidad_rotacion_promedio?: string;
  comision_apertura?: number;
  pago_por_periodo?: number;
  monto_total_a_pagar?: number;
  capacidad_endeudamiento_max?: number;

  plazo_solicitado?: number;
  tipo_de_credito_solicitado?: string;
  monto_solicitado?: number;
  frecuencia_de_pago_solicitada?: number;

  plazo_ofertado?: number;
  tipo_de_credito_ofertado?: string;
  monto_ofertado?: number;
  frecuencia_de_pago_ofertada?: number;

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
