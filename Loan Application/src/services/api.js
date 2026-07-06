import axios from "axios";

const DEFAULT_DEV_BASE_URL = "http://localhost:5000/api";

export const resolveApiBaseUrl = (env = import.meta.env) => {
  const configuredBaseUrl = env?.VITE_API_BASE_URL?.trim();

  if (configuredBaseUrl) {
    const normalizedBaseUrl = configuredBaseUrl.replace(/\/+$/, "");
    return normalizedBaseUrl.endsWith("/api")
      ? normalizedBaseUrl
      : `${normalizedBaseUrl}/api`;
  }

  if (env?.PROD) {
    return "/api";
  }

  return DEFAULT_DEV_BASE_URL;
};

const API = axios.create({
  baseURL: resolveApiBaseUrl(),
});

export default API;