import { useMemo } from "react";

export type StrengthLevel = 0 | 1 | 2 | 3 | 4;

export interface PasswordStrength {
  score: StrengthLevel;
  label: string;
  color: string;
}

const LABELS: Record<StrengthLevel, string> = {
  0: "",
  1: "Débil",
  2: "Regular",
  3: "Fuerte",
  4: "Muy fuerte",
};

const COLORS: Record<StrengthLevel, string> = {
  0: "",
  1: "var(--brand-error)",
  2: "var(--brand-warning)",
  3: "var(--brand-success)",
  4: "var(--brand-strong)",
};

function calcStrength(password: string): StrengthLevel {
  if (!password) return 0;

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return score as StrengthLevel;
}

export function usePasswordStrength(password: string): PasswordStrength {
  return useMemo(() => {
    const score = calcStrength(password);
    return {
      score,
      label: LABELS[score],
      color: COLORS[score],
    };
  }, [password]);
}
