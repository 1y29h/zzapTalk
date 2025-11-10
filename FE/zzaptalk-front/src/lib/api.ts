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

const BASE = (
  process.env.EXPO_PUBLIC_API_BASE || "https://api.zzaptalk.com"
).replace(/\/+$/, "");

// ✅ 전역 토큰 캐시 (+ 외부에서 설정 함수 제공)
let AUTH_TOKEN: string | null = null;
export function setApiAuthToken(token: string | null) {
  AUTH_TOKEN = token;
  if (token) {
    (api.defaults.headers as any).common["Authorization"] = `Bearer ${token}`;
  } else {
    delete (api.defaults.headers as any).common["Authorization"];
  }
}

export const api = axios.create({
  baseURL: BASE || undefined,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (AUTH_TOKEN && !config.headers?.Authorization) {
    (config.headers as any).Authorization = `Bearer ${AUTH_TOKEN}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response) {
      const status = err.response.status;
      const data = err.response.data as any;
      const msg =
        typeof data === "string"
          ? data
          : data?.message || data?.error || data?.msg || `HTTP ${status}`;
      throw new ApiError(msg, status, data);
    }
    if (err.request)
      throw new ApiError("네트워크 오류 또는 서버 응답 없음", 0, null);
    throw new ApiError(err.message || "알 수 없는 오류", -1, null);
  }
);

// 편의 메서드
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

console.log("[API] BASE =", BASE);
