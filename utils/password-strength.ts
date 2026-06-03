export type StrengthLevel = 0 | 1 | 2 | 3 | 4;

export interface PasswordChecks {
  minLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export interface PasswordStrength {
  score: StrengthLevel;
  label: string;
  color: string;
  isWeak: boolean;
  isStrong: boolean;
  checks: PasswordChecks;
}

const LABELS: Record<StrengthLevel, string> = {
  0: "",
  1: "Debil",
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

export function evaluatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      label: LABELS[0],
      color: COLORS[0],
      isWeak: false,
      isStrong: false,
      checks: {
        minLength: false,
        hasUppercase: false,
        hasNumber: false,
        hasSpecialChar: false,
      },
    };
  }

  const checks: PasswordChecks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[^A-Za-z0-9]/.test(password),
  };

  const score = (
    Number(checks.minLength) +
    Number(checks.hasUppercase) +
    Number(checks.hasNumber) +
    Number(checks.hasSpecialChar)
  ) as StrengthLevel;

  return {
    score,
    label: LABELS[score],
    color: COLORS[score],
    isWeak: score <= 1,
    isStrong: score >= 3,
    checks,
  };
}
