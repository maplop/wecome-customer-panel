export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/users/webclients",
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
  },
  USERS: {
    PROFILE: "/users/profile",
    UPDATE: "/users/update",
  },
};

export const CONNECTOR_ENDPOINTS = {
  SEARCH_CURP: "/search/703c3650a69c4ff2869a1075dc24f156",
};

export const CONNECTOR_BASE_URL =
  process.env.NEXT_PUBLIC_API_CONNECTOR_URL || "https://connector.dynamicore.io";
