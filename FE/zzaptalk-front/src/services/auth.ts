// src/services/auth.ts
import { api } from "../lib/api";

const AUTH = {
  SIGNUP: "/api/v1/users/signup", // 백엔드 경로에 맞게 확인
  SMS_REQUEST: "/api/auth/sms/request",
  SMS_VERIFY: "/api/auth/sms/verify",
};

// 타입
export type SignupPayload = {
  phoneNum: string;
  pwd: string;
  name: string;
  rrn: string;
};

// 회원가입 (text/plain 응답 대응)
export async function signup(payload: SignupPayload) {
  const res = await api.post(AUTH.SIGNUP, payload, {
    responseType: "text",
    transformResponse: (v) => v,
  });
  return res.data;
}

// --- (옵션) SMS 관련 ---
export type BaseResp = {
  ok?: boolean;
  success?: boolean;
  message?: string;
  msg?: string;
};

const isOk = (r: BaseResp | any) => {
  if (typeof r === "boolean") return r;
  if (r?.ok !== undefined) return !!r.ok;
  if (r?.success !== undefined) return !!r.success;
  return true;
};

export async function requestSmsCode(phoneNum: string) {
  const res = await api.post<BaseResp>(AUTH.SMS_REQUEST, { phoneNum });
  return { ok: isOk(res), ...res };
}

export async function verifySmsCode(phoneNum: string, code: string) {
  const res = await api.post<BaseResp>(AUTH.SMS_VERIFY, { phoneNum, code });
  return { ok: isOk(res), ...res };
}
