export interface ClientProfileType {
  actividad_economica: string;
  aguinaldo_proporcional: number;
  antiguedad_empresa_anos: number;
  antiguedad_laboral_anos: number;
  antiguedad_laboral_meses: number;

  correo_electronico: string;
  created_at: string;

  curp: string;
  datos_de_contacto: string;
  domicilio_fiscal_y_particular: string;

  edad: number;
  empresa_afiliada: string;
  fecha_de_nacimiento: string;

  historial_crediticio:
    | "Bueno"
    | "Regular"
    | "Débil"
    | "Malo"
    | "No disponible"
    | null;

  nacionalidad: string;
  nivel_de_estudios: string;

  nombres: string;
  primer_apellido: string;
  segundo_apellido: string;

  ocupacion: string;

  regimen_conyugal: string;

  rfc: string;

  sueldo_bruto_mensual: number;

  telefono: string;

  tipo_identificacion_oficial: string;
  numero_identificacion_oficial: string;

  vacaciones_pendientes_dias: number;

  vigencia_preautorizacion: string;
}
