// src/lib/api.ts
import axios, { AxiosError } from "axios";

/** ===============================
 *  커스텀 에러 클래스 정의
 * =============================== */
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

/** ===============================
 *  BASE URL 설정 (.env)
 * =============================== */
const rawBase = process.env.EXPO_PUBLIC_API_BASE || "";
if (!rawBase) {
  console.warn(
    "[API] EXPO_PUBLIC_API_BASE is missing! Check your .env or Cloudflare settings."
  );
}
export const BASE = rawBase.replace(/\/+$/, "");

/** ===============================
 *  전역 토큰 캐시
 * =============================== */
let AUTH_TOKEN: string | null = null;
export function setApiAuthToken(token: string | null) {
  AUTH_TOKEN = token;
  if (token) {
    (api.defaults.headers as any).common["Authorization"] = `Bearer ${token}`;
  } else {
    delete (api.defaults.headers as any).common["Authorization"];
  }
}

/** ===============================
 *  Axios 인스턴스 생성
 * =============================== */
export const api = axios.create({
  baseURL: BASE || undefined,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

/** ===============================
 *  커스텀 필드 확장 (skipAuth)
 * =============================== */
declare module "axios" {
  export interface AxiosRequestConfig {
    /** 인증이 필요 없는 요청 (로그인, 회원가입 등) */
    skipAuth?: boolean;
  }
}

/** ===============================
 *  요청 인터셉터
 * =============================== */
api.interceptors.request.use((config) => {
  // ✅ Axios 1.x 타입 호환: headers를 AxiosHeaders로 정규화
  const headers = axios.AxiosHeaders.from(config.headers);
  config.headers = headers;

  // 인증 불필요 요청 (로그인/회원가입 등)
  if (config.skipAuth) return config;

  // Authorization 헤더가 비어 있고 토큰이 있을 경우 자동 부착
  if (AUTH_TOKEN && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${AUTH_TOKEN}`);
  }

  return config;
});

/** ===============================
 *  응답 인터셉터 (에러 표준화)
 * =============================== */
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
      return Promise.reject(new ApiError(msg, status, data));
    }

    if (err.request) {
      return Promise.reject(
        new ApiError("네트워크 오류 또는 서버 응답 없음", 0, null)
      );
    }

    return Promise.reject(
      new ApiError(err.message || "알 수 없는 오류", -1, null)
    );
  }
);

/** ===============================
 *  공통 요청 메서드
 * =============================== */
export async function get<T>(url: string, params?: any): Promise<T> {
  const { data } = await api.get<T>(url, { params });
  return data;
}

export async function post<T>(url: string, body?: any, cfg?: any): Promise<T> {
  const { data } = await api.post<T>(url, body, cfg);
  return data;
}

export async function put<T>(url: string, body?: any, cfg?: any): Promise<T> {
  const { data } = await api.put<T>(url, body, cfg);
  return data;
}

export async function del<T>(url: string, cfg?: any): Promise<T> {
  const { data } = await api.delete<T>(url, cfg);
  return data;
}

console.log("[API] BASE =", BASE || "(empty)");
