import type { EvaluateScoreResponse } from "@/types/score";

import type { NormalizedCreditType } from "@/utils/credit-type";

export type IconKey = "shield-check" | "shield";

export interface CreditBreakdown {
  tipo: string;
  iconKey: IconKey;
  titulo: string;
  descripcion: string;
  pagoPeriodico: {
    pagoBase: number;
    segurosIva: number;
    total: number;
  };
  totales: {
    capitalIntereses: number;
    segurosIva: number;
    total: number;
    comisionApertura: number;
  };
  mostrarSeguros: boolean;
  mostrarComision: boolean;
}

export const round2 = (n: number) => Math.round(n * 100) / 100;

export function calculateCreditBreakdown(
  response: EvaluateScoreResponse,
  tipoDeCredito?: NormalizedCreditType | null,
): CreditBreakdown {
  const isProtected = tipoDeCredito === "protected";

  if (isProtected) {
    return {
      tipo: "Protegido",
      iconKey: "shield-check",
      titulo: "Crédito Protegido",
      descripcion: "Tu crédito incluye seguros + IVA",
      pagoPeriodico: {
        pagoBase: response.pago_por_periodo_sin_seguros,
        segurosIva: round2(
          response.pago_por_periodo_con_seguros_iva -
            response.pago_por_periodo_sin_seguros,
        ),
        total: response.pago_por_periodo_con_seguros_iva,
      },
      totales: {
        capitalIntereses: response.monto_total_a_pagar,
        segurosIva: round2(
          response.monto_total_a_pagar_con_seguros -
            response.monto_total_a_pagar,
        ),
        total: response.monto_total_a_pagar_con_seguros,
        comisionApertura: response.comision_apertura,
      },
      mostrarSeguros: true,
      mostrarComision: true,
    };
  }

  return {
    tipo: "Esencial",
    iconKey: "shield",
    titulo: "Crédito Esencial",
    descripcion: "Tu crédito NO incluye seguros ni IVA",
    pagoPeriodico: {
      pagoBase: response.pago_por_periodo_sin_seguros,
      segurosIva: 0,
      total: response.pago_por_periodo_sin_seguros,
    },
    totales: {
      capitalIntereses: response.monto_total_a_pagar,
      segurosIva: 0,
      total: response.monto_total_a_pagar,
      comisionApertura: response.comision_apertura,
    },
    mostrarSeguros: false,
    mostrarComision: true,
  };
}
