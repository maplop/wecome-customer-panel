export interface ClientProfileType {
  // ========== IDENTIDAD PERSONAL ==========
  nombre: string;
  segundo_nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  fecha_de_nacimiento: string;
  edad: number;
  curp: string;
  RFC: string;

  // ========== CONTACTO ==========
  email: string;

  // ========== DOMICILIO ==========
  pais: string;
  estado: string;
  ciudad: string;
  calle: string;
  numero_exterior: string;
  codigo_postal: string;

  // ========== EMPLEO ACTUAL ==========
  empresa: string;
  antiguedad_en_anhos_empresa_actual: number;
  anhos_activamente_trabajando: number;

  // ========== COMPENSACIÓN Y PRESTACIONES ==========
  salario_bruto_mensual: number;
  aguinaldo_proporcional: number;
  vacaciones_pendientes: number;

  // ========== INFORMACIÓN COMPLEMENTARIA ==========
  historial_crediticio: string | null;
}
