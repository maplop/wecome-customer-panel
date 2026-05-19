import axios, { AxiosInstance } from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://front.dynamicore.io";
const CONTEXT = process.env.NEXT_PUBLIC_DYNAMICORE_MORAL_CONTEXT || "";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    context: CONTEXT,
  },
});

// Interceptor for requests
apiClient.interceptors.request.use(
  (config) => {
    // Ensure context header is always set
    if (!config.headers["context"]) {
      config.headers["context"] = CONTEXT;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor for responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  },
);

export default apiClient;
