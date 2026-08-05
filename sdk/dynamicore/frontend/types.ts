// Payment calendar response types
export interface PaymentCycle {
  amount: number;
  date: string;
  status?: string;
  past?: string;
}

export interface PaymentCalendarData {
  all?: {
    cycles: PaymentCycle[];
  };
  open?: {
    old_cycle: PaymentCycle;
  };
  due?: {
    cycles: PaymentCycle[];
    total_amount: number;
  };
}

// Account data response types
export interface AccountData {
  id: number;
  principal?: number;
  installments?: number;
  [key: string]: unknown;
}

// Amortization simulator response types
export interface AmortizationRow {
  date: string;
  cycle: number;
  balance: number;
  payment: {
    paid: number;
    expected: number;
  };
  principal: {
    paid: number;
    expected: number;
  };
  interest: {
    paid: number;
    expected: number;
  };
  payment_day: boolean;
  final_balance: number;
}

export interface AmortizationHeader {
  name: string;
  label: string;
  type?: string;
  money?: string;
  format?: string;
}

export interface AmortizationSimulatorData {
  rows: AmortizationRow[];
  headers: AmortizationHeader[];
  properties: {
    total: number;
    interest: number;
    commision: number;
    principal: number;
    ultima_fecha: string;
    interest_rate: number;
    iva_commision: number | null;
    principal_expected_sum: number;
    interest_tax_expected_sum: number | null;
    amount_commission_opening_with_iva: number;
  };
}

export type ClientBody = Record<string, unknown>;
export type ClientMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ClientError extends Error {
  code?: number;
  message: string;
}

export interface ClientResponse {
  code: number;
  headers?: Record<string, string>;
  data:
    | ClientBody
    | ClientBody[]
    | PaymentCalendarData
    | AccountData
    | AccountData[]
    | AmortizationSimulatorData;
}
