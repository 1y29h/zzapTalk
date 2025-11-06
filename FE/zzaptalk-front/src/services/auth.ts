// src/services/auth.ts
import { post } from "../lib/api";

// 서버 경로(프리픽스 /api 포함)
const AUTH = {
  SIGNUP: "/api/auth/signup",
  SMS_REQUEST: "/api/auth/sms/request",
  SMS_VERIFY: "/api/auth/sms/verify",
};

// 타입
export type SignupPayload = {
  phoneNum: string; // 숫자만
  pwd: string;
  name: string;
  rrn: string; // 앞 7자리(현재는 앞6 + 뒤1을 합쳐 보냄)
};

// --- SMS (나중에 붙일 예정이면 유지) ---
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
  const res = await post<BaseResp>(AUTH.SMS_REQUEST, { phoneNum });
  return { ok: isOk(res), ...res };
}

export async function verifySmsCode(phoneNum: string, code: string) {
  const res = await post<BaseResp>(AUTH.SMS_VERIFY, { phoneNum, code });
  return { ok: isOk(res), ...res };
}

// --- 회원가입 ---
// post()는 api 인터셉터를 사용하므로 4xx/5xx면 ApiError를 throw 합니다.
// 따라서 여기선 성공만 반환하고, 화면에서는 await 통과 후 라우팅하면 됩니다.
export async function signup(payload: SignupPayload) {
  const data = await post<{ user?: any }>(AUTH.SIGNUP, payload);
  return data.user ?? true; // 성공이면 truthy
}
