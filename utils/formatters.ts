export interface FormatNumberOptions {
  decimals?: number;
  locale?: string;
}

export interface FormatCurrencyOptions extends FormatNumberOptions {
  currency?: string;
}

const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function parseDateInput(value: string | Date): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const raw = value.trim();
  if (!raw) return null;

  // dd/mm/yyyy
  const dmyMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmyMatch) {
    const day = Number(dmyMatch[1]);
    const month = Number(dmyMatch[2]);
    const year = Number(dmyMatch[3]);
    const parsed = new Date(year, month - 1, day);

    if (
      parsed.getFullYear() === year &&
      parsed.getMonth() === month - 1 &&
      parsed.getDate() === day
    ) {
      return parsed;
    }
    return null;
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDateLongEs(value?: string | Date | null): string {
  if (!value) return "-";
  const parsed = parseDateInput(value);
  if (!parsed) return typeof value === "string" ? value : "-";

  const day = parsed.getDate();
  const month = MONTHS_ES[parsed.getMonth()] ?? "";
  const year = parsed.getFullYear();
  return `${day} de ${month} del ${year}`;
}

export function formatNumberWithThousands(
  value?: string | number | null,
  options: FormatNumberOptions = {},
): string {
  const { decimals = 2, locale = "en-US" } = options;
  const numberValue =
    typeof value === "string" ? Number(value.replace(/,/g, "")) : Number(value);

  if (!Number.isFinite(numberValue)) return "-";

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numberValue);
}

export function formatMxPhoneNumber(value?: string | number | null): string {
  const digits = `${value || ""}`.replace(/\D/g, "");
  if (!digits) return "";

  let localDigits = digits;
  if (digits.length >= 12 && digits.startsWith("52")) {
    localDigits = digits.slice(-10);
  } else if (digits.length > 10) {
    localDigits = digits.slice(-10);
  }

  if (localDigits.length !== 10) return `+${digits}`;

  const lada = localDigits.slice(0, 3);
  const part1 = localDigits.slice(3, 6);
  const part2 = localDigits.slice(6, 10);
  return `+52 ${lada} ${part1} ${part2}`;
}

export function toPositiveNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function normalizePaymentFrequency(
  value?: string | number | { id?: number } | null,
): "SEMANAL" | "QUINCENAL" | "MENSUAL" {
  if (typeof value === "number")
    return value === 2 ? "MENSUAL" : value === 3 ? "SEMANAL" : "QUINCENAL";
  if (value && typeof value === "object")
    return (value as { id?: number }).id === 2
      ? "MENSUAL"
      : (value as { id?: number }).id === 3
        ? "SEMANAL"
        : "QUINCENAL";
  if (typeof value === "string") {
    if (value === "1" || value === "2" || value === "3")
      return value === "2"
        ? "MENSUAL"
        : value === "3"
          ? "SEMANAL"
          : "QUINCENAL";
    const upper = value.toUpperCase();
    if (upper === "SEMANAL") return "SEMANAL";
    if (upper === "MENSUAL") return "MENSUAL";
    return "QUINCENAL";
  }
  return "QUINCENAL";
}

export function formatPaymentFrequency(value?: string | number | null): string {
  const freq = normalizePaymentFrequency(value);
  if (freq === "SEMANAL") return "Semanal";
  if (freq === "MENSUAL") return "Mensual";
  return "Quincenal";
}
