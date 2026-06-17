export type NormalizedCreditType = "protected" | "esencial";

export function normalizeCreditType(
  value?: string | null,
): NormalizedCreditType | null {
  const raw = value?.trim().toLowerCase();
  if (!raw) return null;

  if (raw === "protected" || raw === "protegido") return "protected";
  if (raw === "esencial") return "esencial";

  return null;
}

export function isProtectedCredit(value?: string | null): boolean {
  return normalizeCreditType(value) === "protected";
}

export function getCreditTypeLabel(value?: string | null): string {
  const normalized = normalizeCreditType(value);
  if (normalized === "protected") return "Protegido";
  if (normalized === "esencial") return "Esencial";
  return value?.trim() || "—";
}
