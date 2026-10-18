// Detalle del producto contratado (cuenta de crédito).
// Nombres de dominio: hablamos de plazos, pagos y tabla de amortización,
// no del nombre técnico del endpoint.

export type CreditInstallmentStatus = "open" | "paid" | "due" | "late" | string;

export interface CreditPaymentAmount {
  paid: number;
  expected: number;
}

export interface CreditInstallmentBreakdown {
  interest: number;
  principal: number;
  unemploymentInsurance: number;
  unemploymentInsuranceTax: number;
  outstandingBalanceInsurance: number;
  outstandingBalanceInsuranceTax: number;
}

export interface CreditInstallmentDetail {
  total: number;
  breakdown: CreditInstallmentBreakdown;
}

// Un plazo del crédito (cada quincena/mes a pagar).
export interface CreditInstallment {
  term: string;
  dueDate: string;
  amount: number;
  status: CreditInstallmentStatus;
  paid: number;
  late: number;
  isOverdue: boolean;
  detail: CreditInstallmentDetail;
}

// Grupo de plazos: próximos, pendientes, liquidados.
export interface CreditInstallmentGroup {
  totalTerms: number;
  totalAmount: number;
  installments: CreditInstallment[];
  nextTerm: CreditInstallment | null;
  previousTerm: CreditInstallment | null;
}

// Resumen general del producto (lo que venía en `all`).
export interface CreditProductSummary extends CreditInstallmentGroup {
  lateTerms: number;
  currentAmount: number;
  overdueAmount: number;
  paidAmountLabel: string;
  paidTermsLabel: string;
}

// Fila de la tabla de amortización (lo que venía en `payment_calendar`).
export interface CreditAmortizationRow {
  term: number;
  dueDate: string;
  balance: number;
  finalBalance: number;
  daysOverdue: number;
  isPast: boolean;
  isPaid: boolean;
  payment: CreditPaymentAmount;
  principal: CreditPaymentAmount;
  interest: CreditPaymentAmount;
  interestTax: CreditPaymentAmount;
  totalPayment: CreditPaymentAmount;
  unemploymentInsurance: CreditPaymentAmount;
  unemploymentInsuranceTax: CreditPaymentAmount;
  outstandingBalanceInsurance: CreditPaymentAmount;
  outstandingBalanceInsuranceTax: CreditPaymentAmount;
}

// Detalle completo del producto contratado.
export interface CreditAccountDetails {
  /** Resumen general: plazos totales, pagados, saldo actual. */
  summary: CreditProductSummary;
  /** Próximos pagos / vencidos (lo que venía en `due`). */
  upcoming: CreditInstallmentGroup;
  /** Plazos pendientes por pagar (lo que venía en `open`). */
  pending: CreditInstallmentGroup;
  /** Plazos ya liquidados (lo que venía en `paid`). */
  settled: CreditInstallmentGroup;
  /** Tabla de amortización completa. */
  amortizationTable: CreditAmortizationRow[];
}
