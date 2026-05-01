import axios from "axios";

const API_BASE: string =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({ baseURL: API_BASE });

// Attach token lazily at request time — import store here to avoid circular dep
api.interceptors.request.use((config) => {
  // Lazy import to avoid circular dependency with authStore
  const token = (() => {
    try {
      const raw = localStorage.getItem("flowx-auth");
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { state?: { token?: string } };
      return parsed?.state?.token ?? null;
    } catch {
      return null;
    }
  })();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      localStorage.removeItem("flowx-auth");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export const fetchHistory = async (symbol: string, period: string) => {
  const { data } = await api.get<{
    symbol: string;
    data: import("../store/marketStore").OHLCVPoint[];
  }>(`/api/history/${symbol}?period=${period}`);
  return data;
};

export const fetchQuotes = async () => {
  const { data } = await api.get<{
    data: import("../store/marketStore").Quote[];
    timestamp: string;
  }>("/api/quotes");
  return data;
};

export default api;
