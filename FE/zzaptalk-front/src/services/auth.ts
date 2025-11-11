// 🛑 [수정 1] import 변경
import { post, ApiError } from "../lib/api";

/** ========================
 * 엔드포인트
 * ======================== */
const AUTH = {
  LOGIN: "/api/v1/users/login",
  SIGNUP: "/api/v1/users/signup",
  SMS_REQUEST: "/api/auth/sms/request",
  SMS_VERIFY: "/api/auth/sms/verify",
};

/** ========================
 * 유틸
 * ======================== */
const digits = (v?: string) => (v ? v.replace(/\D/g, "") : v || "");
// (이하 유틸 함수들은 동일하게 유지)
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
  expiresIn: number;
  userId: number;
  nickname: string;
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
 * ======================== */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  // 1) 전처리 (동일)
  const pwd = (payload.pwd || "").trim();
  const phone = digits(payload.phoneNum);
  const email = (payload.email || "").trim();
  const zzapID = (payload.zzapID || "").trim();

  if (!pwd) {
    throw new ApiError("비밀번호는 필수로 입력해야 합니다.", 400, null);
  }
  if (!phone && !email && !zzapID) {
    throw new ApiError(
      "로그인 식별자(전화번호/이메일/ZzapID) 중 하나를 입력해야 합니다.",
      400,
      null
    );
  }

  const body: Record<string, string> = { pwd };
  if (phone) body.phoneNum = phone;
  else if (email) body.email = email;
  else body.zzapID = zzapID; // 2) API 호출 // 🛑 [수정 2] 'api.post' -> 'post' 헬퍼 사용 // 'post' 헬퍼는 data를 바로 반환하므로 { data } 구조분해 X

  const data = await post<LoginResponse>(AUTH.LOGIN, body, {
    skipAuth: true,
  }); // 3) 응답 검증 및 반환

  if (!data?.accessToken || data.userId == null) {
    throw new ApiError("로그인 응답 형식이 올바르지 않습니다.", 500, data);
  } // 'data'가 바로 LoginResponse 객체입니다.

  return data;
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
  }; // 🛑 [수정 3] 'api.post' -> 'post' 헬퍼 사용

  const resText = await post<string>(AUTH.SIGNUP, body, {
    responseType: "text",
    transformResponse: (v: any) => v, // text 응답을 그대로 반환
    skipAuth: true,
  });
  return resText.toString();
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
  // 🛑 [수정 4] 'api.post' -> 'post' 헬퍼 사용
  const data = await post<BaseResp>(
    AUTH.SMS_REQUEST,
    { phoneNum: digits(phoneNum) },
    { skipAuth: true }
  );
  return { ok: isOk(data), ...data };
}

export async function verifySmsCode(phoneNum: string, code: string) {
  // 🛑 [수정 5] 'api.post' -> 'post' 헬퍼 사용
  const data = await post<BaseResp>(
    AUTH.SMS_VERIFY,
    { phoneNum: digits(phoneNum), code: (code || "").trim() },
    { skipAuth: true }
  );
  return { ok: isOk(data), ...data };
}
