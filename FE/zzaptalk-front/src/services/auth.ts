// src/services/auth.ts
import { api } from "../lib/api";

/** ========================
 * 엔드포인트
 *  - 로그인은 현재 /api/v1/users/login 로 동작 (스크린샷 기준)
 *  - 회원가입은 /api/v1/users/signup
 * ======================== */
const AUTH = {
  LOGIN: "/api/v1/users/login",
  SIGNUP: "/api/v1/users/signup",

  // (옵션) SMS 관련
  SMS_REQUEST: "/api/auth/sms/request",
  SMS_VERIFY: "/api/auth/sms/verify",
};

/** ========================
 * 유틸
 * ======================== */
const digits = (v?: string) => (v ? v.replace(/\D/g, "") : v || "");
const cleanToken = (t: string) => String(t).trim().replace(/^"|"$/g, "");
const looksLikeJwt = (v: string) =>
  typeof v === "string" && v.split(".").length === 3;
const parseJwtExpMs = (jwt: string) => {
  try {
    const [, payload] = jwt.split(".");
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
    return typeof json?.exp === "number" ? json.exp * 1000 : null;
  } catch {
    return null;
  }
};

/** ========================
 * 타입
 * ======================== */
export type LoginPayload = {
  phoneNum?: string;
  email?: string;
  zzapID?: string;
  pwd: string;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: "Bearer";
  /** 남은 만료시간(ms). 서버 JSON이면 그대로, text 토큰이면 exp에서 계산해 세팅 */
  expiresIn: number;
};

export type SignupPayload = {
  phoneNum: string;
  pwd: string;
  name: string;
  rrn: string;
};

export type BaseResp = {
  ok?: boolean;
  success?: boolean;
  message?: string;
  msg?: string;
};

/** ========================
 * 로그인
 *  - 서버가 JSON({accessToken, tokenType, expiresIn}) 또는 text/plain(JWT) 둘 다 올 수 있음
 *  - 항상 LoginResponse 형태로 정규화해서 반환
 * ======================== */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  // 1) 전처리
  const pwd = (payload.pwd || "").trim();
  const phone = digits(payload.phoneNum);
  const email = (payload.email || "").trim();
  const zzapID = (payload.zzapID || "").trim();

  if (!pwd) throw new Error("비밀번호를 입력해 주세요.");
  if (!phone && !email && !zzapID) {
    throw new Error("전화번호/이메일/ZZAP ID 중 하나를 입력해 주세요.");
  }

  // one-of 식별자만 보냄
  const body: Record<string, string> = { pwd };
  if (phone) body.phoneNum = phone;
  else if (email) body.email = email;
  else body.zzapID = zzapID;

  // 2) JSON 응답 먼저 시도
  try {
    const { data } = await api.post<LoginResponse>(AUTH.LOGIN, body, {
      skipAuth: true,
    });
    if (data?.accessToken) {
      return {
        accessToken: String(data.accessToken),
        tokenType: (data.tokenType as any) === "Bearer" ? "Bearer" : "Bearer",
        expiresIn:
          typeof data.expiresIn === "number" && data.expiresIn > 0
            ? data.expiresIn
            : 3600_000, // 방어값
      };
    }
  } catch {
    // JSON 실패 시 text로 재시도
  }

  // 3) text/plain(JWT 문자열) 재시도
  const { data: raw } = await api.post<string>(AUTH.LOGIN, body, {
    skipAuth: true,
    responseType: "text",
    transformResponse: (v) => v,
  });

  const token = cleanToken(raw as unknown as string);
  if (!looksLikeJwt(token))
    throw new Error("로그인 응답 형식이 올바르지 않습니다.");

  const expMs = parseJwtExpMs(token);
  const expiresIn = expMs ? Math.max(0, expMs - Date.now()) : 3600_000;

  return { accessToken: token, tokenType: "Bearer", expiresIn };
}

/** ========================
 * 회원가입 (서버가 text/plain 메시지 반환)
 * ======================== */
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
    skipAuth: true,
  });
  return (res.data as unknown as string)?.toString();
}

/** ========================
 * (옵션) SMS 관련
 * ======================== */
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
    { skipAuth: true }
  );
  return { ok: isOk(data), ...data };
}

export async function verifySmsCode(phoneNum: string, code: string) {
  const { data } = await api.post<BaseResp>(
    AUTH.SMS_VERIFY,
    { phoneNum: digits(phoneNum), code: (code || "").trim() },
    { skipAuth: true }
  );
  return { ok: isOk(data), ...data };
}
