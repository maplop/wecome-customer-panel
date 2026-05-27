// lib/routes.ts
export const ROUTES = {
  HOME: "/onboarding/curp-verification",
  AUTH: {
    ROOT: "/auth",
    LOGIN: "/auth/login",
    RECOVER_REQUEST: "/auth/recover-request",
    RECOVER_VERIFY: "/auth/recover-verify",
    RECOVER_RESET: "/auth/recover-reset",
  },
  ONBOARDING: {
    ROOT: "/onboarding",
    CREATE_ACCOUNT: "/onboarding/create-account",
    CREDIT_RESULT: "/onboarding/credit-result",
    CREDIT_SELECTION: "/onboarding/credit-selection",
    CREDIT_SUCCESS: "/onboarding/credit-success",
    CREDIT_SUMMARY: "/onboarding/credit-summary",
    CURP_VERIFICATION: "/onboarding/curp-verification",
    FINAL_CONFIRM: "/onboarding/final-confirm",
    FINANCIAL_DATA: "/onboarding/financial-data",
    IDENTITY_VERIFICATION: "/onboarding/identity-verification",
    PERSONAL_DATA: "/onboarding/personal-data",
    TERMS_ACCEPTANCE: "/onboarding/terms-acceptance",
    UPLOAD_DOCUMENTS: "/onboarding/upload-documents",
    USER_CONFIRM: "/onboarding/user-confirm",
  },
  DASHBOARD: {
    ROOT: "/dashboard",
  },
} as const;

export const ONBOARDING_STEPS = [
  {
    title: "Verificacion de CURP",
    step: 1,
    route: ROUTES.ONBOARDING.CURP_VERIFICATION,
  },
  {
    title: "Confirmación de usuario",
    step: 2,
    route: ROUTES.ONBOARDING.USER_CONFIRM,
  },
  {
    title: "Verificacion de identidad",
    step: 3,
    route: ROUTES.ONBOARDING.IDENTITY_VERIFICATION,
  },
  {
    title: "Creacion de cuenta",
    step: 4,
    route: ROUTES.ONBOARDING.CREATE_ACCOUNT,
  },
  {
    title: "Datos personales",
    step: 5,
    route: ROUTES.ONBOARDING.PERSONAL_DATA,
  },
  {
    title: "Carga de documentos",
    step: 6,
    route: ROUTES.ONBOARDING.UPLOAD_DOCUMENTS,
  },
  {
    title: "Datos financieros",
    step: 7,
    route: ROUTES.ONBOARDING.FINANCIAL_DATA,
  },
  {
    title: "Resultado de credito",
    step: 8,
    route: ROUTES.ONBOARDING.CREDIT_RESULT,
  },
  {
    title: "Seleccion de credito",
    step: 9,
    route: ROUTES.ONBOARDING.CREDIT_SELECTION,
  },
  {
    title: "Resumen de credito",
    step: 10,
    route: ROUTES.ONBOARDING.CREDIT_SUMMARY,
  },
  {
    title: "Confirmación final",
    step: 11,
    route: ROUTES.ONBOARDING.FINAL_CONFIRM,
  },
  {
    title: "Aceptacion de terminos",
    step: 12,
    route: ROUTES.ONBOARDING.TERMS_ACCEPTANCE,
  },
  {
    title: "Credito exitoso",
    step: 13,
    route: ROUTES.ONBOARDING.CREDIT_SUCCESS,
  },
] as const;

export const PROTECTED_ONBOARDING_ROUTES = new Set<string>([
  ROUTES.DASHBOARD.ROOT,
  ROUTES.ONBOARDING.PERSONAL_DATA,
  ROUTES.ONBOARDING.UPLOAD_DOCUMENTS,
  ROUTES.ONBOARDING.FINANCIAL_DATA,
  ROUTES.ONBOARDING.CREDIT_RESULT,
  ROUTES.ONBOARDING.CREDIT_SELECTION,
  ROUTES.ONBOARDING.CREDIT_SUMMARY,
  ROUTES.ONBOARDING.FINAL_CONFIRM,
  ROUTES.ONBOARDING.TERMS_ACCEPTANCE,
  ROUTES.ONBOARDING.CREDIT_SUCCESS,
]);
