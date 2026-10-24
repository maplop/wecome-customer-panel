export type NormalizedCreditType = "protected" | "essential";

export function normalizeCreditType(
  value?: string | { id?: string } | null,
): NormalizedCreditType | null {
  const raw = (
    value !== null && typeof value === "object"
      ? (value as { id?: string }).id
      : value
  )
    ?.trim()
    .toLowerCase();
  if (!raw) return null;

  if (raw === "protected" || raw === "protegido") return "protected";
  if (raw === "essential") return "essential";

  return null;
}

export function isProtectedCredit(value?: string | null): boolean {
  return normalizeCreditType(value) === "protected";
}

export function getCreditTypeLabel(value?: string | null): string {
  const normalized = normalizeCreditType(value);
  if (normalized === "protected") return "Protegido";
  if (normalized === "essential") return "Esencial";
  return value?.trim() || "—";
}
