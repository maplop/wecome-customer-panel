export interface ClientProfileType {
  actividad_economica: string;
  aguinaldo_proporcional: string;
  antiguedad: string;
  correo_electronico: string;
  curp: string;
  datos_de_contacto: string;
  domicilio_fiscal_y_particular: string;
  edad: number;
  empresa: string;
  fecha_de_nacimiento: string;
  historial_crediticio: "Bueno" | "Regular" | "Débil" | "Malo" | "No disponible";
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
  vacaciones_pendientes: string;
  vigencia_preautorizacion: string;
  _regimen_conyugal: string;
  created_at: string;
}
