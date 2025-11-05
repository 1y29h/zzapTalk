// src/services/auth.ts
import { post } from "../lib/api";

// 서버 경로만 여기서 관리
const AUTH = {
  SIGNUP: "/auth/signup",
  SMS_REQUEST: "/auth/sms/request",
  SMS_VERIFY: "/auth/sms/verify",
};

// 서버 응답 공통 타입(예시) — 실제 포맷에 맞게 조정 가능
export type BaseResp = {
  ok?: boolean;
  success?: boolean;
  message?: string;
  msg?: string;
};

// 여러 포맷 대응: { ok:true } 또는 { success:true } 등
function isOk(r: BaseResp | any) {
  if (typeof r === "boolean") return r;
  if (r?.ok !== undefined) return !!r.ok;
  if (r?.success !== undefined) return !!r.success;
  // 200 빈 응답 등을 true로 간주
  return true;
}

export type SignupPayload = {
  phoneNum: string; // 숫자만
  pwd: string;
  name: string;
  rrn: string; // 앞 7자리
};

export async function requestSmsCode(phoneNum: string) {
  const res = await post<BaseResp>(AUTH.SMS_REQUEST, { phoneNum });
  return { ok: isOk(res), ...res };
}

export async function verifySmsCode(phoneNum: string, code: string) {
  const res = await post<BaseResp>(AUTH.SMS_VERIFY, { phoneNum, code });
  return { ok: isOk(res), ...res };
}

export async function signup(payload: SignupPayload) {
  const res = await post<BaseResp & { userId?: string }>(AUTH.SIGNUP, payload);
  return { ok: isOk(res), ...res };
}
