import { api } from "../lib/api";

/** 백엔드 엔드포인트 */
const AUTH = {
  LOGIN: "/api/auth/login",
  SIGNUP: "/api/v1/users/signup",

  // (옵션) SMS 관련
  SMS_REQUEST: "/api/auth/sms/request",
  SMS_VERIFY: "/api/auth/sms/verify",
};

/* =========================
 * 유틸
 * ========================= */
const digits = (v?: string) => (v ? v.replace(/\D/g, "") : v || "");
const cleanToken = (t: string) => String(t).trim().replace(/^"|"$/g, "");

/* =========================
 * 로그인
 *  - 서버가 "JWT 문자열"을 text/plain으로 반환
 * ========================= */
export type LoginPayload = {
  phoneNum?: string;
  email?: string;
  zzapID?: string;
  pwd: string;
};

export async function login(payload: LoginPayload): Promise<string> {
  // 1) 비밀번호/식별자 방어적 전처리
  const pwd = (payload.pwd || "").trim();
  const phone = digits(payload.phoneNum);
  const email = (payload.email || "").trim();
  const zzapID = (payload.zzapID || "").trim();

  if (!pwd) throw new Error("비밀번호를 입력해 주세요.");
  if (!phone && !email && !zzapID) {
    throw new Error("전화번호/이메일/ZZAP ID 중 하나를 입력해 주세요.");
  }

  // 2) 실제 존재하는 식별자 하나만 전송 (one-of)
  const body: Record<string, string> = { pwd };
  if (phone) body.phoneNum = phone;
  else if (email) body.email = email;
  else body.zzapID = zzapID;

  const res = await api.post<string>(AUTH.LOGIN, body, {
    responseType: "text",
    transformResponse: (v) => v,
    skipAuth: true, // 인증 토큰 미부착
  });

  return cleanToken(res.data as unknown as string);
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
  const body = {
    phoneNum: digits(payload.phoneNum),
    pwd: (payload.pwd || "").trim(),
    name: (payload.name || "").trim(),
    rrn: (payload.rrn || "").trim(),
  };

  const res = await api.post(AUTH.SIGNUP, body, {
    responseType: "text",
    transformResponse: (v) => v,
    skipAuth: true, // 가입도 인증 불필요
  });
  return (res.data as unknown as string)?.toString();
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
  const { data } = await api.post<BaseResp>(
    AUTH.SMS_REQUEST,
    { phoneNum: digits(phoneNum) },
    { skipAuth: true } // ✅ 인증 미부착
  );
  return { ok: isOk(data), ...data };
}

export async function verifySmsCode(phoneNum: string, code: string) {
  const { data } = await api.post<BaseResp>(
    AUTH.SMS_VERIFY,
    { phoneNum: digits(phoneNum), code: (code || "").trim() },
    { skipAuth: true } // ✅ 인증 미부착
  );
  return { ok: isOk(data), ...data };
}
