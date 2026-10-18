import { apiClient, SERVICES } from "@/sdk/dynamicore/frontend";
import type { ApiResponse } from "@/types/api-response";
import type {
  CreditAccountDetails,
  CreditAmortizationRow,
  CreditInstallment,
  CreditInstallmentBreakdown,
  CreditInstallmentDetail,
  CreditInstallmentGroup,
  CreditPaymentAmount,
  CreditProductSummary,
} from "@/types/credit-account";

type RawRecord = Record<string, unknown>;

function isRecord(value: unknown): value is RawRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toNumber(value: unknown, fallback = 0): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function toAmount(value: unknown): CreditPaymentAmount {
  if (!isRecord(value)) return { paid: 0, expected: 0 };
  return { paid: toNumber(value.paid), expected: toNumber(value.expected) };
}

function mapBreakdown(raw: unknown): CreditInstallmentBreakdown {
  const r = isRecord(raw) ? raw : {};
  return {
    interest: toNumber(r.interest),
    principal: toNumber(r.principal),
    unemploymentInsurance: toNumber(r.unemployment_insurance),
    unemploymentInsuranceTax: toNumber(r.unemployment_insurance_tax),
    outstandingBalanceInsurance: toNumber(r.outstanding_balance_insurance),
    outstandingBalanceInsuranceTax: toNumber(
      r.outstanding_balance_insurance_tax,
    ),
  };
}

function mapDetail(raw: unknown): CreditInstallmentDetail {
  const r = isRecord(raw) ? raw : {};
  const elements = isRecord(r.elements) ? r.elements : r;
  return {
    total: toNumber(r.total),
    breakdown: mapBreakdown(elements),
  };
}

// Un plazo del endpoint -> término de dominio.
function mapInstallment(raw: unknown): CreditInstallment | null {
  if (!isRecord(raw)) return null;
  if (raw.date == null && raw.cycle == null) return null;
  return {
    term: String(raw.cycle ?? ""),
    dueDate: String(raw.date ?? ""),
    amount: toNumber(raw.amount),
    status: String(raw.status ?? "open"),
    paid: toNumber(raw.paid),
    late: toNumber(raw.late),
    isOverdue: String(raw.past ?? "false") === "true",
    detail: mapDetail(raw.detail),
  };
}

function mapInstallments(raw: unknown): CreditInstallment[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(mapInstallment)
    .filter((item): item is CreditInstallment => item !== null);
}

function mapGroup(raw: unknown): CreditInstallmentGroup {
  const r = isRecord(raw) ? raw : {};
  const installments = mapInstallments(r.cycles);
  const mapSingle = (value: unknown): CreditInstallment | null =>
    mapInstallment(value);
  return {
    totalTerms: toNumber(r.total, installments.length),
    totalAmount: toNumber(r.total_amount),
    installments,
    nextTerm: isRecord(r.new_cycle) ? mapSingle(r.new_cycle) : null,
    previousTerm: isRecord(r.old_cycle) ? mapSingle(r.old_cycle) : null,
  };
}

function mapSummary(raw: unknown): CreditProductSummary {
  const r = isRecord(raw) ? raw : {};
  const group = mapGroup({ ...r, total: r.total, total_amount: r.total_amount });
  const paidTotal = isRecord(r.paid_total) ? r.paid_total : {};
  return {
    ...group,
    lateTerms: toNumber(r.late),
    currentAmount: toNumber(r.actual),
    overdueAmount: toNumber(r.vencido ?? r.va_cp),
    paidAmountLabel: String(paidTotal.amount ?? ""),
    paidTermsLabel: String(paidTotal.cycles ?? ""),
  };
}

function mapAmortizationRow(raw: unknown): CreditAmortizationRow | null {
  if (!isRecord(raw)) return null;
  if (raw.date == null && raw.cycle == null) return null;
  const totalPayment = toAmount(raw.payment_total);
  return {
    term: toNumber(raw.cycle),
    dueDate: String(raw.date ?? ""),
    balance: toNumber(raw.balance),
    finalBalance: toNumber(raw.final_balance),
    daysOverdue: toNumber(raw.day_due),
    isPast: String(raw.past ?? "false") === "true",
    isPaid: totalPayment.paid > 0,
    payment: toAmount(raw.payment),
    principal: toAmount(raw.principal),
    interest: toAmount(raw.interest),
    interestTax: toAmount(raw.interest_tax),
    totalPayment,
    unemploymentInsurance: toAmount(raw.unemployment_insurance),
    unemploymentInsuranceTax: toAmount(raw.unemployment_insurance_tax),
    outstandingBalanceInsurance: toAmount(raw.outstanding_balance_insurance),
    outstandingBalanceInsuranceTax: toAmount(
      raw.outstanding_balance_insurance_tax,
    ),
  };
}

function mapAmortizationTable(raw: unknown): CreditAmortizationRow[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(mapAmortizationRow)
    .filter((row): row is CreditAmortizationRow => row !== null);
}

function mapAccountDetails(raw: unknown): CreditAccountDetails {
  const r = isRecord(raw) ? raw : {};
  return {
    summary: mapSummary(r.all),
    upcoming: mapGroup(r.due),
    pending: mapGroup(r.open),
    settled: mapGroup(r.paid),
    amortizationTable: mapAmortizationTable(r.payment_calendar),
  };
}

/**
 * Detalle del producto contratado por `account` (= product_id guardado
 * en la solicitud al aprobar).
 */
export async function getCreditAccountDetails(
  accountId: number,
): Promise<CreditAccountDetails> {
  if (!Number.isFinite(accountId) || accountId <= 0) {
    throw new Error("account (product_id) inválido.");
  }

  // El curl original manda GET con body { account }, en axios los GET
  // viajan por query params: ?account=159319
  const { data: response } = await apiClient.get<
    ApiResponse<unknown>
  >(SERVICES.GET_MORATORY_PAYMENTS, { params: { account: accountId } });

  const raw = response as unknown;
  const code = isRecord(raw) ? raw.code : undefined;
  const status = isRecord(raw) ? raw.status : undefined;
  const isGatewayOk =
    (code === 200 || code === 1) && (status === "success" || status === "ok");
  if (!isRecord(raw) || !isGatewayOk) {
    throw new Error("No se pudo obtener el detalle del producto.");
  }

  return mapAccountDetails((raw as unknown as ApiResponse<unknown>).data);
}
