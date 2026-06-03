import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api/social";

export const socialApi = () => {
  const token = localStorage.getItem("access");

  const instance = axios.create({
    baseURL: API_BASE,
  });

  // 🔐 Attach auth token (if exists)
  instance.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 🚨 VERY IMPORTANT
      // ❌ DO NOT manually set Content-Type
      // Axios will automatically:
      // - use application/json for normal requests
      // - use multipart/form-data for FormData (image uploads)
      return config;
    },
    (error) => Promise.reject(error)
  );

  return instance;
};
