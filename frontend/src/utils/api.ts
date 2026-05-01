import axios from "axios";
import { useAuthStore } from "../store/authStore";

const API_BASE: string =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      useAuthStore.getState().logout();
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
