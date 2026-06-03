// src/lib/api.js
import axios from "axios";
import { getAccess, getRefresh, saveTokens, clearTokens } from "./auth";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
});

const NO_AUTH_URLS = [
  "/api/auth/register/",
  "/api/auth/token/",
  "/api/auth/refresh/",
];

// -------------------- REQUEST --------------------
API.interceptors.request.use((config) => {
  const url = config.url || "";

  if (NO_AUTH_URLS.some((path) => url.includes(path))) {
    return config;
  }

  const token = getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// -------------------- RESPONSE --------------------
let isRefreshing = false;

API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !original._retry &&
      getRefresh()
    ) {
      original._retry = true;

      const url = original.url || "";
      if (NO_AUTH_URLS.some((p) => url.includes(p))) {
        return Promise.reject(error);
      }

      if (isRefreshing) return Promise.reject(error);
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${API.defaults.baseURL}/api/auth/refresh/`,
          { refresh: getRefresh() }
        );

        saveTokens({ access: data.access });
        isRefreshing = false;

        original.headers.Authorization = `Bearer ${data.access}`;
        return API(original);
      } catch (e) {
        isRefreshing = false;
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
