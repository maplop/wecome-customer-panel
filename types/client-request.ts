export interface AmortizacionRow {
  date: string;
  cycle: number;
  balance: number;
  payment: AmortizacionAmount;
  payment_total?: AmortizacionAmount;
  interest: AmortizacionAmount;
  principal: AmortizacionAmount;
  interest_tax?: AmortizacionAmount;
  unemployment_insurance?: AmortizacionAmount;
  unemployment_insurance_tax?: AmortizacionAmount;
  outstanding_balance_insurance?: AmortizacionAmount;
  outstanding_balance_insurance_tax?: AmortizacionAmount;
  final_balance: number;
}

export interface AmortizacionAmount {
  paid: number;
  expected: number;
}

export interface ClientRequestData {
  estado?: RequestStatus;
  perfil?: string;
  historial_crediticio_usado?: string;
  probabilidad_rotacion_promedio?: string;
  comision_apertura?: number;
  // El backend tiene un solo campo pago_por_periodo. Siempre enviamos el valor
  // correcto según el tipo de crédito (con seguros+IVA para "protected", sin seguros para el resto).
  pago_por_periodo?: number;
  // El backend tiene un solo campo monto_total_a_pagar. Siempre enviamos el valor
  // correcto según el tipo de crédito (con seguros para "protected", sin seguros para el resto).
  monto_total_a_pagar?: number;
  // Solo se usa en memoria/caché local para mostrar el desglose en la UI.
  // NO se envía al backend.
  monto_total_a_pagar_con_seguros?: number;
  capacidad_endeudamiento_max?: number;

  plazo_solicitado?: number;
  tipo_de_credito_solicitado?: string;
  monto_solicitado?: number;
  frecuencia_de_pago_solicitada?: number;

  // La oferta del otorgante solo varía el monto; plazo, tipo y frecuencia
  // se leen de los campos _solicitado correspondientes.
  monto_ofertado?: number;

  evaluation_id?: string;

  product_id?: number;
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
