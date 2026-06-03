// types/client-data.ts

export interface ClientPii {
  cat?: string;
  ine?: string;
  rfc?: string;
  sex?: string;
  city?: string;
  curp?: string;
  name?: string;
  aforo?: string;
  email?: string;
  fecha?: string;
  phone?: string;
  state?: string;
  colony?: string;
  moneda?: string;
  pagare?: string;
  street?: string;
  fecha_1?: string;
  num_ext?: string;
  num_int?: string;
  seguros?: string;
  zipcode?: string;
  fullname?: string;
  birthdate?: string;
  birthstate?: string;
  secondname?: string;
  nationality?: string;
  dia_de_corte?: string;
  forma_de_pago?: string;
  monto_del_pago?: string;
  motherlastname?: string;
  saldo_insoluto?: string;
  tipo_de_avaluo?: string;
  capital_vencido?: string;
  capital_vigente?: string;
  tipo_de_credito?: string;
  apellido_paterno?: string;
  fuente_del_score?: string;
  nivel_de_estudio?: string;
  tipo_de_garantia?: string;
  numero_de_credito?: string;
  sucursal___region?: string;
  autorizacion_sic_2?: string;
  ejecutivo_promotor?: string;
  intereses_cobrados?: string;
  referencia_de_tasa?: string;
  saldo_total_deudor?: string;
  actividad_economica?: string;
  destino_del_credito?: string;
  iva_sobre_intereses?: string;
  numero_de_escritura?: string;
  producto_financiero?: string;
  comision_por_prepago?: string;
  fecha_de_originacion?: string;
  fecha_de_vencimiento?: string;
  intereses_devengados?: string;
  intereses_moratorios?: string;
  periodicidad_de_pago?: string;
  comision_por_apertura?: string;
  comisiones_por_cobrar?: string;
  fecha_limite_del_pago?: string;
  comision_por_anualidad?: string;
  tipo_de_identificacion?: string;
  dias_de_mora_acumulados?: string;
  esquema_de_amortizacion?: string;
  monto_de_la_mensualidad?: string;
  numero_de_pagos_totales?: string;
  comision_por_disposicion?: string;
  comprobante_de_domicilio?: string;
  numero_de_dias_de_atraso?: string;
  numero_de_identificacion?: string;
  aviso_de_privacidad_wecom?: string;
  nombre_del_garante_o_aval?: string;
  numero_de_folio_registral?: string;
  numero_de_pagos_restantes?: string;
  tasa_de_interes_moratoria?: string;
  tasa_de_interes_ordinaria?: string;
  aplicacion_del_pago_de_iva?: string;
  autorizacion_de_publicidad?: string;
  ingreso_mensual_comprobado?: string;
  monto_original_del_credito?: string;
  numero_de_pagos_realizados?: string;
  relacion_deuda_ingreso_dti?: string;
  valor_del_bien_en_garantia?: string;
  numero_de_consultas_al_buro?: string;
  autorizacion_de_seguro_wecom?: string;
  comision_por_manejo_de_cuenta?: string;
  nivel_de_endeudamiento_previo?: string;
  aplicacion_del_pago_de_capital?: string;
  aplicacion_del_pago_de_interes?: string;
  reporte_de_credito_consolidado?: string;
  aplicacion_del_pago_de_comision?: string;
  score_crediticio_en_originacion?: string;
  antiguedad_laboral___empresarial?: string;
  gestiones_de_cobranza_realizadas?: string;
  numero_de_veces_que_ha_incumplido?: string;
  cobertura_de_seguro_sobre_garantia?: string;
  historial_de_reestructuras_o_quitas?: string;
  spread___margen_sobre_la_referencia?: string;
  autorizacion_de_historial_crediticio?: string;
  relacion_del_garante_con_el_acreditado?: string;
}

export interface ClientData {
  id?: number;
  company?: number;
  status?: string;
  external_id?: string;
  pii?: ClientPii;
  client_type?: number;
  created_at?: string;
  pd?: number;
  username?: string;
  group?: number;
}

export interface CompanyLogo {
  imagotipoDarkH?: string | null;
  imagotipoHorizontal?: string | null;
  [key: string]: unknown;
}

export interface CompanyTheme {
  primary?: string;
  [key: string]: unknown;
}

export interface CompanySiteSecurity {
  recommendMFA?: boolean;
  global_sign_out?: boolean;
  [key: string]: unknown;
}

export interface CompanySitePaymentMethods {
  cards?: unknown[];
  [key: string]: unknown;
}

export interface CompanySiteConfig {
  security?: CompanySiteSecurity;
  payment_methods?: CompanySitePaymentMethods;
  [key: string]: unknown;
}

export interface CompanySite {
  config?: CompanySiteConfig;
  [key: string]: unknown;
}

export interface Company extends Record<string, unknown> {
  id: number;
  name: string;
  timezone?: number | null;
  date_format?: string | null;
  street_address?: string | null;
  city?: string | null;
  zipcode?: string | null;
  state?: string | null;
  country?: string | null;
  email?: string | null;
  logo?: CompanyLogo | null;
  icon?: string | null;
  tax_id?: string | null;
  lgd?: number | null;
  theme?: CompanyTheme | null;
  public_key?: string | null;
  url?: string | null;
  site?: CompanySite | null;
  headers?: unknown[];
  user_key?: string | null;
  config?: Record<string, unknown> | null;
  entity_type?: string;
  cnbv_auth_number?: string | null;
  status?: string;
  tier?: string;
}

export interface ClientPeopleType extends Record<string, unknown> {
  id?: number;
}

export interface ClientSessionDataPayload extends Record<string, unknown> {
  company?: Company | null;
  people?: ClientData;
  peopleType?: ClientPeopleType;
  legal_representative_document_upload?: Array<Record<string, unknown>>;
}

export interface ClientSessionEntities {
  accountIds: number[];
  companyId?: number;
  groupId?: number;
  peopleId: number;
  peopleTypeId?: number;
}

export interface ClientSessionData {
  id?: number | string;
  data?: ClientSessionDataPayload;
  entities: ClientSessionEntities;
}

export interface ClientDataState {
  id?: number | string;
  data?: ClientSessionDataPayload;
  entities?: ClientSessionEntities;
  setClientData: (clientData: ClientSessionData) => void;
  clearClientData: () => void;
}

export interface GatewayEnvelope<T> {
  object?: string;
  code?: number;
  status?: string;
  message?: string;
  request?: number;
  url?: string;
  data?: T;
  total?: number;
}

export interface InfoStatement {
  Action?: string[];
  Effect?: string;
  Resource?: string;
}

export interface InfoResponse {
  user?: number | string;
  group?: number;
  company?: number;
  objects?: Record<string, unknown>;
  json_rol?: {
    Version?: number;
    Statement?: InfoStatement[];
  };
}

export interface ClientInfo {
  user?: number | string;
  company?: number;
  group?: number;
  peopleId: number;
}
