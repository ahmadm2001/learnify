// src/lib/auth.js

// --- Save tokens to localStorage ---
export function saveTokens({ access, refresh }) {
  if (access) localStorage.setItem("access", access);
  if (refresh) localStorage.setItem("refresh", refresh);
}

// --- Get access token ---
export function getAccess() {
  return localStorage.getItem("access");
}

// --- Get refresh token ---
export function getRefresh() {
  return localStorage.getItem("refresh");
}

// --- Check login status ---
export function isLoggedIn() {
  return !!localStorage.getItem("access");
}

// --- Clear tokens (logout) ---
export function clearTokens() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}
