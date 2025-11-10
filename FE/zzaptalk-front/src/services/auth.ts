import { api } from "../lib/api";

/** 백엔드 엔드포인트 */
const AUTH = {
  LOGIN: "/api/v1/users/login", // ✅ 변경됨 (/api/auth/login → /api/v1/users/login)
  SIGNUP: "/api/v1/users/signup",

  // (옵션) SMS 관련
  SMS_REQUEST: "/api/auth/sms/request",
  SMS_VERIFY: "/api/auth/sms/verify",
};

/* =========================
 * 로그인
 *  - 서버가 "JWT 문자열"만 반환
 *  - exp가 토큰에 들어있으므로 expiresIn 없이 startSession(token) 호출 가능
 * ========================= */
export type LoginPayload = {
  phoneNum?: string;
  email?: string;
  zzapID?: string;
  pwd: string;
};

export async function login(payload: LoginPayload): Promise<string> {
  const res = await api.post<string>(AUTH.LOGIN, payload, {
    // 서버가 text/plain 으로 토큰만 내려보냄 → 문자열 그대로 받기
    responseType: "text",
    transformResponse: (v) => v,
    // 혹시 인터셉터가 Authorization을 붙이지 않도록 명시 제거
    headers: { Authorization: undefined as any },
  });
  // 예: res.data === "eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3MzExND..."
  return res.data as string;
}

/* =========================
 * 회원가입 (서버가 text/plain 메시지 반환)
 * ========================= */
export type SignupPayload = {
  phoneNum: string;
  pwd: string;
  name: string;
  rrn: string;
};

export async function signup(payload: SignupPayload) {
  const res = await api.post(AUTH.SIGNUP, payload, {
    responseType: "text",
    transformResponse: (v) => v,
  });
  // 예: "회원가입이 성공적으로 완료되었습니다."
  return res.data as string;
}

/* =========================
 * (옵션) SMS 관련
 * ========================= */
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
  const { data } = await api.post<BaseResp>(AUTH.SMS_REQUEST, { phoneNum });
  return { ok: isOk(data), ...data };
}

export async function verifySmsCode(phoneNum: string, code: string) {
  const { data } = await api.post<BaseResp>(AUTH.SMS_VERIFY, {
    phoneNum,
    code,
  });
  return { ok: isOk(data), ...data };
}
