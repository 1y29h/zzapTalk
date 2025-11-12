// src/services/auth.ts
import { post, ApiError } from "../lib/api";

export type LoginPayload = {
  phoneNum?: string;
  email?: string;
  zzapID?: string;
  pwd: string;
};

/** 로그인 - 토큰 문자열만 반환 */
export async function login(payload: LoginPayload): Promise<string> {
  const pwd = (payload.pwd || "").trim();
  const phone = (payload.phoneNum || "").replace(/\D/g, "");
  const email = (payload.email || "").trim();
  const zzapID = (payload.zzapID || "").trim();

  if (!pwd) throw new ApiError("비밀번호는 필수로 입력해야 합니다.", 400, null);
  if (!phone && !email && !zzapID) {
    throw new ApiError(
      "전화번호/이메일/ID 중 하나를 입력해 주세요.",
      400,
      null
    );
  }

  const body: any = { pwd };
  if (phone) body.phoneNum = phone;
  else if (email) body.email = email;
  else body.zzapID = zzapID;

  const res: any = await post("/api/v1/users/login", body, { skipAuth: true });

  const token =
    typeof res === "string"
      ? res
      : res?.accessToken ?? res?.token ?? res?.data?.accessToken ?? "";

  if (!token) throw new ApiError("로그인 응답에 토큰이 없습니다.", 500, res);
  return String(token).trim().replace(/^"|"$/g, "");
}
