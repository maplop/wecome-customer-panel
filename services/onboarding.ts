import {
  CONNECTOR_SERVICES,
  NOTIFICATION_TEMPLATE,
  connectorApiClient,
} from "@/api/dynamicore/connector";

export const ONBOARDING_OTP_CLIENT = 142296;
export const ONBOARDING_OTP_TYPE = "client";

export interface ClientWhitelistData {
  actividad_economica: string;
  antiguedad: string;
  correo_electronico: string;
  curp: string;
  datos_de_contacto: string;
  domicilio_fiscal_y_particular: string;
  edad: number;
  empresa: string;
  fecha_de_nacimiento: string;
  nacionalidad: string;
  nivel_de_estudios: string;
  nombres: string;
  numero_identificacion_oficial: string;
  ocupacion: string;
  primer_apellido: string;
  rfc: string;
  salario: number;
  segundo_apellido: string;
  telefono: string;
  tipo_identificacion_oficial: string;
  created_at: string;
}

interface WhitelistHit {
  _source?: ClientWhitelistData;
}

interface SearchCurpResponse {
  hits?: WhitelistHit[];
}

interface SendOtpResult {
  channel: string;
  success: boolean;
}

interface SendOtpResponse {
  data?: {
    all_results?: SendOtpResult[];
  };
}

interface ValidateOtpResponse {
  data?: {
    valid?: boolean;
  };
}

export async function verifyCurpInWhitelist(
  curp: string,
): Promise<ClientWhitelistData | null> {
  const response = await connectorApiClient.post<SearchCurpResponse>(
    CONNECTOR_SERVICES.SEARCH_CURP,
    {
      fields: [`curp:${curp}`],
      page: 1,
      limit: 10,
    },
  );

  return response.data.hits?.[0]?._source ?? null;
}

export async function sendOtp(email: string): Promise<boolean> {
  const response = await connectorApiClient.post<SendOtpResponse>(
    CONNECTOR_SERVICES.SEND_OTP,
    {
      email,
      client: ONBOARDING_OTP_CLIENT,
      template: NOTIFICATION_TEMPLATE,
      type: ONBOARDING_OTP_TYPE,
    },
  );

  const emailResult = response.data?.data?.all_results?.find(
    (item) => item.channel === "EMAIL",
  );

  return Boolean(emailResult?.success);
}

export async function validateOtp(otp: string): Promise<boolean> {
  const response = await connectorApiClient.post<ValidateOtpResponse>(
    CONNECTOR_SERVICES.VALIDATE_OTP,
    {
      client: ONBOARDING_OTP_CLIENT,
      type: ONBOARDING_OTP_TYPE,
      otp,
    },
  );

  return response.data?.data?.valid === true;
}
