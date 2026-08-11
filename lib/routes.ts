// lib/routes.ts
export const ROUTES = {
  HOME: "/onboarding/curp-verification",
  PROFILE: {
    ROOT: "/profile",
    PASSWORD_CHANGE: "/profile/password-change",
  },
  AUTH: {
    ROOT: "/auth",
    LOGIN: "/auth/login",
    RECOVER_REQUEST: "/auth/recover-request",
    RECOVER_VERIFY: "/auth/recover-verify",
  },
  ONBOARDING: {
    ROOT: "/onboarding",
    CREATE_ACCOUNT: "/onboarding/create-account",
    CREDIT_RESULT: "/onboarding/credit-result",
    CREDIT_AUTHORIZATION: "/onboarding/credit-authorization",
    CREDIT_SELECTION: "/onboarding/credit-selection",
    CREDIT_SUCCESS: "/onboarding/credit-success",
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
    title: "Verificación de CURP",
    step: 1,
    route: ROUTES.ONBOARDING.CURP_VERIFICATION,
  },
  {
    title: "Confirmación de usuario",
    step: 2,
    route: ROUTES.ONBOARDING.USER_CONFIRM,
  },
  {
    title: "Verificación de identidad",
    step: 3,
    route: ROUTES.ONBOARDING.IDENTITY_VERIFICATION,
  },
  {
    title: "Creación de cuenta",
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
    title: "Aceptación de términos",
    step: 7,
    route: ROUTES.ONBOARDING.TERMS_ACCEPTANCE,
  },
  {
    title: "Selección de crédito",
    step: 8,
    route: ROUTES.ONBOARDING.CREDIT_SELECTION,
  },
  {
    title: "Resultado de crédito",
    step: 9,
    route: ROUTES.ONBOARDING.CREDIT_RESULT,
  },
  /*
  {
    title: "Autorización de consulta",
    step: 9,
    route: ROUTES.ONBOARDING.CREDIT_AUTHORIZATION,
  },
  */
  {
    title: "Crédito exitoso",
    step: 10,
    route: ROUTES.ONBOARDING.CREDIT_SUCCESS,
  },
] as const;

export const PROTECTED_ONBOARDING_ROUTES = new Set<string>([
  ROUTES.DASHBOARD.ROOT,
  ROUTES.ONBOARDING.PERSONAL_DATA,
  ROUTES.ONBOARDING.UPLOAD_DOCUMENTS,
  ROUTES.ONBOARDING.FINANCIAL_DATA,
  ROUTES.ONBOARDING.CREDIT_AUTHORIZATION,
  ROUTES.ONBOARDING.CREDIT_RESULT,
  ROUTES.ONBOARDING.CREDIT_SELECTION,
  ROUTES.ONBOARDING.FINAL_CONFIRM,
  ROUTES.ONBOARDING.TERMS_ACCEPTANCE,
  ROUTES.ONBOARDING.CREDIT_SUCCESS,
]);
