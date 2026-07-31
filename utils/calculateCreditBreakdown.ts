import { ClientRequestData } from "@/types/client-request";
import { toPositiveNumber } from "./formatters";

export type IconKey = "shield-check" | "shield";

export interface CreditBreakdown {
  tipo: string;
  iconKey: IconKey;
  titulo: string;
  descripcion: string;
  pagoPeriodico: {
    pagoBase: number;
    seguroVida: number;
    seguroInvalidez: number;
    subtotal: number;
    iva: number;
    total: number;
  };
  totales: {
    capitalIntereses: number;
    seguros: number;
    iva: number;
    total: number;
    comisionApertura: number;
    totalConComision: number;
  };
  mostrarSeguros: boolean;
  mostrarIva: boolean;
  mostrarComision: boolean;
  mostrarSubtotal: boolean;
}

const IVA_RATE = 0.16;

export function calculateCreditBreakdown(
  data: ClientRequestData,
): CreditBreakdown {
  const amount = toPositiveNumber(data.monto_solicitado) ?? 0;
  const isProtected = data.tipo_de_credito_solicitado === "protected";

  const pagoSinSeguros =
    toPositiveNumber(data.pago_por_periodo_sin_seguros) ?? 0;
  const pagoConSegurosIva =
    toPositiveNumber(data.pago_por_periodo_con_seguros_iva) ?? 0;
  const numeroPeriodos = toPositiveNumber(data.numero_de_periodos) ?? 0;
  const montoTotalAPagar = toPositiveNumber(data.monto_total_a_pagar) ?? 0;
  const comisionApertura = toPositiveNumber(data.comision_apertura) ?? 0;

  const seguroVidaAlMillar = toPositiveNumber(data.seguro_vida) ?? 0;
  const seguroInvalidezAlMillar =
    toPositiveNumber(data.seguro_invalidez_total_permanente) ?? 0;
  const seguroVidaPeriodo = amount * (seguroVidaAlMillar / 1000);
  const seguroInvalidezPeriodo = amount * (seguroInvalidezAlMillar / 1000);
  const segurosPeriodo = seguroVidaPeriodo + seguroInvalidezPeriodo;

  if (isProtected) {
    const subtotal = pagoSinSeguros + segurosPeriodo;
    const ivaPeriodo = subtotal * IVA_RATE;
    const totalConTodo = pagoConSegurosIva * numeroPeriodos;

    return {
      tipo: "Protegido",
      iconKey: "shield-check",
      titulo: "Crédito Protegido",
      descripcion: "Tu crédito incluye seguros de vida e invalidez + IVA",
      pagoPeriodico: {
        pagoBase: pagoSinSeguros,
        seguroVida: seguroVidaPeriodo,
        seguroInvalidez: seguroInvalidezPeriodo,
        subtotal,
        iva: ivaPeriodo,
        total: pagoConSegurosIva,
      },
      totales: {
        capitalIntereses: montoTotalAPagar,
        seguros: segurosPeriodo * numeroPeriodos,
        iva: ivaPeriodo * numeroPeriodos,
        total: totalConTodo,
        comisionApertura,
        totalConComision: totalConTodo + comisionApertura,
      },
      mostrarSeguros: true,
      mostrarIva: true,
      mostrarComision: true,
      mostrarSubtotal: true,
    };
  }

  return {
    tipo: "Esencial",
    iconKey: "shield",
    titulo: "Crédito Esencial",
    descripcion: "Tu crédito NO incluye seguros ni IVA",
    pagoPeriodico: {
      pagoBase: pagoSinSeguros,
      seguroVida: 0,
      seguroInvalidez: 0,
      subtotal: pagoSinSeguros,
      iva: 0,
      total: pagoSinSeguros,
    },
    totales: {
      capitalIntereses: montoTotalAPagar,
      seguros: 0,
      iva: 0,
      total: montoTotalAPagar,
      comisionApertura,
      totalConComision: montoTotalAPagar + comisionApertura,
    },
    mostrarSeguros: false,
    mostrarIva: false,
    mostrarComision: true,
    mostrarSubtotal: false,
  };
}
