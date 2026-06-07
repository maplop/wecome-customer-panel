export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://front.dynamicore.io";
export const API_CONTEXT =
  process.env.NEXT_PUBLIC_DYNAMICORE_MORAL_CONTEXT || "";

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/users/new_webclients",
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    CONFIRM_USER: "/users/confirmUserAttributes",
  },
  USERS: {
    PROFILE: "/users/profile",
    UPDATE: "/users/update",
  },
} as const;

export const SERVICES = {
  ACCOUNTS: "/private/accounts",
  ACCOUNTS_CONNECTOR:
    "/internal/connector/4034/flows/8b35131557494e2fb4c50280531148cf",
  ACCOUNTS_DESTINATION: "/private/accounts/destination",
  ACCOUNTS_DESTINATION_V2: "/marketplace/apps/destination",
  ACCOUNTS_FILTER: "/private/public/clients_accounts/filter",
  ACCOUNTS_BY_CLIENTS: "/private/clients/accounts_by_client",
  ACCOUNTS_PROCESSOR:
    "/internal/connector/4034/flows/0c247947a3834c758e4f6428949729b0",
  ACCOUNTS_SIMULATOR: "/private/accounts/v2/table_virtual",

  ALERTS: "/private/v2/notifications/alerts",
  ALERT_READ: "/private/notifications/alerts",

  COMPANY: "/private/company",
  CONTRACT_CONNECTOR:
    "/internal/connector/4034/flows/ab06cf4ad67143419212735730df484a",

  PEOPLE: "/private/clients",
  PEOPLE_TYPES: "/private/clients_types",
  PEOPLE_ORGANIZATIONAL: "/private/clients/organizational",
  PEOPLE_ORGANIZATIONAL_OLD: "/private/clients/get_people_organizational",

  USERS_GET_INFO: "/private/users/get_info",

  GET_MOVEMENTS: "/private/accounts/payment_calendar",
  GET_MORATORY_PAYMENTS: "/private/accounts/payment_calendar_by_config_m",
  GET_TRANSACTIONS: "/private/accounts/movements",
  GET_DATE_PAYEMENT: "/marketplace/apps/mgiver/calculate_date",

  JUMIO_VERIFICATION: "/marketplace/apps/jumio",

  GET_CABLE: "/private/accounts/get_cable",
  USERS_WEBCLIENTS: API_ENDPOINTS.AUTH.REGISTER,
};
