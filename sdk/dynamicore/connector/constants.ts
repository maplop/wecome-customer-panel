export const CONNECTOR_API_URL =
  process.env.NEXT_PUBLIC_API_CONNECTOR_URL ||
  "https://connector.dynamicore.io";

export const CONNECTOR_SERVICES = {
  SEARCH_CURP: "/search/703c3650a69c4ff2869a1075dc24f156",
  WHITE_LIST: "/search/5c56a7d270684bbf808f1acb272e8a73",
  SEND_OTP: "/send_otp/20003817e871418cae27e82d3561830f",
  VALIDATE_OTP: "/validate-otp/c57bff8bc2f64888952472aba403b818",
  SEND_EMAIL: "/send-email/af03699e88204e5d8e3c26c544bcda14",
};

export const NOTIFICATION_TEMPLATE = 1917;
