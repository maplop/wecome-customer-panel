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

  // `total_amount` puede venir null en créditos recién originados.
  // Fallback: suma de los amount de las cuotas del grupo.
  const totalAmountRaw = r.total_amount != null ? toNumber(r.total_amount) : null;
  const totalAmount =
    totalAmountRaw ??
    installments.reduce((sum, i) => sum + i.amount, 0);

  return {
    totalTerms: toNumber(r.total, installments.length),
    totalAmount,
    installments,
    nextTerm: isRecord(r.new_cycle) ? mapSingle(r.new_cycle) : null,
    previousTerm: isRecord(r.old_cycle) ? mapSingle(r.old_cycle) : null,
  };
}

function mapSummary(raw: unknown): CreditProductSummary {
  const r = isRecord(raw) ? raw : {};
  const group = mapGroup({ ...r, total: r.total, total_amount: r.total_amount });
  const paidTotal = isRecord(r.paid_total) ? r.paid_total : {};

  // `actual` viene null en créditos recién originados sin movimientos.
  // En ese caso el saldo pendiente es igual al total del crédito.
  const actualRaw = r.actual != null ? toNumber(r.actual) : null;
  const totalAmount = toNumber(r.total_amount);
  const currentAmount = actualRaw ?? totalAmount;

  return {
    ...group,
    lateTerms: toNumber(r.late),
    currentAmount,
    overdueAmount: toNumber(r.vencido ?? r.va_cp),
    paidAmountLabel: String(paidTotal.amount ?? ""),
    paidTermsLabel: String(paidTotal.cycles ?? ""),
  };
}

function extractCycleNumbers(group: unknown): Set<number> {
  const set = new Set<number>();
  if (!isRecord(group) || !Array.isArray(group.cycles)) return set;
  for (const c of group.cycles) {
    if (isRecord(c) && c.cycle != null) {
      const num = Number(c.cycle);
      if (Number.isFinite(num)) {
        set.add(num);
      }
    }
  }
  return set;
}

function getTodayYmd(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

interface CyclesStatusContext {
  dueCycles: Set<number>;
  openCycles: Set<number>;
  paidCycles: Set<number>;
}

function mapAmortizationRow(
  raw: unknown,
  context?: CyclesStatusContext,
): CreditAmortizationRow | null {
  if (!isRecord(raw)) return null;
  if (raw.date == null && raw.cycle == null) return null;
  const totalPayment = toAmount(raw.payment_total);
  const term = toNumber(raw.cycle);
  const dueDate = String(raw.date ?? "");
  const daysOverdue = toNumber(raw.day_due);

  const isPaid =
    (context?.paidCycles.has(term) ?? false) || totalPayment.paid > 0;

  // Comparación de fecha contra hoy (formato YYYY-MM-DD)
  const dateMatch = dueDate.trim().match(/^(\d{4}-\d{2}-\d{2})/);
  const isDatePast = dateMatch ? dateMatch[1] < getTodayYmd() : false;

  let isPast = false;
  if (!isPaid) {
    if (context && (context.dueCycles.size > 0 || context.openCycles.size > 0)) {
      if (context.dueCycles.has(term)) {
        isPast = true;
      } else if (context.openCycles.has(term)) {
        isPast = false;
      } else {
        isPast = isDatePast;
      }
    } else {
      isPast = isDatePast;
    }
  }

  return {
    term,
    dueDate,
    balance: toNumber(raw.balance),
    finalBalance: toNumber(raw.final_balance),
    daysOverdue,
    isPast,
    isPaid,
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
    detail: mapDetail(raw.detail),
  };
}

function mapAmortizationTable(
  raw: unknown,
  rawContext?: RawRecord,
): CreditAmortizationRow[] {
  if (!Array.isArray(raw)) return [];
  const context: CyclesStatusContext = {
    dueCycles: extractCycleNumbers(rawContext?.due),
    openCycles: extractCycleNumbers(rawContext?.open),
    paidCycles: extractCycleNumbers(rawContext?.paid),
  };

  return raw
    .map((item) => mapAmortizationRow(item, context))
    .filter((row): row is CreditAmortizationRow => row !== null);
}

function mapAccountDetails(raw: unknown): CreditAccountDetails {
  const r = isRecord(raw) ? raw : {};
  return {
    summary: mapSummary(r.all),
    upcoming: mapGroup(r.due),
    pending: mapGroup(r.open),
    settled: mapGroup(r.paid),
    amortizationTable: mapAmortizationTable(r.payment_calendar, r),
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
