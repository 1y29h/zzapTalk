// src/lib/api.ts
import axios, { AxiosError } from "axios";

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const BASE = (process.env.EXPO_PUBLIC_API_BASE || "").replace(/\/+$/, "");
if (!BASE) {
  // 개발 중 변수 누락 빨리 알림
  // eslint-disable-next-line no-console
  console.warn("[API] EXPO_PUBLIC_API_BASE is empty. Check your .env");
}

export const api = axios.create({
  baseURL: BASE || undefined,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 (토큰 필요해지면 여기서 붙이면 돼)
api.interceptors.request.use((config) => {
  // 예) const token = await SecureStore.getItemAsync("token");
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 응답/에러 인터셉터 (서버 에러 포맷 통일)
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response) {
      const status = err.response.status;
      const data = err.response.data as any;
      const msg = data?.message || data?.error || data?.msg || `HTTP ${status}`;
      throw new ApiError(msg, status, data);
    }
    if (err.request) {
      throw new ApiError("네트워크 오류 또는 서버 응답 없음", 0, null);
    }
    throw new ApiError(err.message || "알 수 없는 오류", -1, null);
  }
);

// (선택) 메서드 헬퍼
export async function get<T>(url: string, params?: any): Promise<T> {
  const { data } = await api.get<T>(url, { params });
  return data;
}
export async function post<T>(url: string, body?: any): Promise<T> {
  const { data } = await api.post<T>(url, body);
  return data;
}
export async function put<T>(url: string, body?: any): Promise<T> {
  const { data } = await api.put<T>(url, body);
  return data;
}
export async function del<T>(url: string): Promise<T> {
  const { data } = await api.delete<T>(url);
  return data;
}
