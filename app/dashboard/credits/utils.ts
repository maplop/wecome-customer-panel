import { ESTADO_CONFIG } from "@/components/Dashboard/constants/request-status";
import { formatMoney } from "@/utils/formatters";
import type { CreditAmortizationRow } from "@/types/credit-account";

export function safeMoney(value?: number | null): string {
  return value != null && Number.isFinite(value) ? formatMoney(value) : "—";
}

export function formatShortDate(value?: string | null): string {
  if (!value) return "—";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!match) return value;

  const [, year, month, day] = match;
  const monthIndex = Number(month) - 1;
  if (monthIndex < 0 || monthIndex > 11) return value;

  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${day} ${months[monthIndex]} ${year}`;
}

// "0.00/49412.04" -> [0, 49412.04]
export function parseFraction(label?: string | null): [number, number] {
  if (!label) return [0, 0];
  const [paid, total] = label.split("/");
  const paidNum = Number(paid);
  const totalNum = Number(total);
  return [
    Number.isFinite(paidNum) ? paidNum : 0,
    Number.isFinite(totalNum) ? totalNum : 0,
  ];
}

export function installmentStatusMeta(row: CreditAmortizationRow) {
  if (row.isPaid) {
    return { ...ESTADO_CONFIG.completed, label: "Pagado" };
  }
  if (row.isPast && !row.isPaid) {
    return {
      label: "Vencido",
      className: "bg-red-500/10 text-red-600 dark:text-red-400",
      dot: "bg-red-500",
    };
  }
  return { ...ESTADO_CONFIG.pending, label: "Pendiente" };
}
