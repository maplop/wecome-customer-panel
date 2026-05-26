export const CONNECTOR_API_URL =
  process.env.NEXT_PUBLIC_API_CONNECTOR_URL || "https://connector.dynamicore.io";

export const CONNECTOR_SERVICES = {
  SEARCH_CURP: "/search/703c3650a69c4ff2869a1075dc24f156",
  WHITE_LIST: "/search/5c56a7d270684bbf808f1acb272e8a73",
  SEND_OTP: "/send_otp/6c9c8fba1a38470f83d5e0813241ac53",
  VALIDATE_OTP: "/validate-otp/8d19321b7b93442d9eda8dfb7bb55274",
};

export const NOTIFICATION_TEMPLATE = 1917;
