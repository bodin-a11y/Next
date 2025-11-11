// lib/api.ts
import axios from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:4001";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // чтобы кука token от мок-сервера тоже работала
  headers: { "Content-Type": "application/json" },
});

// простая обёртка над localStorage для токена
const TOKEN_KEY = "token";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

// прикрепляем Bearer ко всем запросам
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// единая обработка 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // опционально: можно диспатчить logout-событие
      // window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    return Promise.reject(err);
  }
);
