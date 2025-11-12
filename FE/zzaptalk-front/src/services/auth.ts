// src/services/auth.ts
import { post, ApiError, setApiAuthToken } from "../lib/api";
import { saveTokenWithExpiry } from "../lib/authStorage";
import { parseJwt } from "../lib/jwt";

export type LoginPayload = {
  phoneNum?: string;
  email?: string;
  zzapID?: string;
  pwd: string;
};

/** 로그인 - 토큰 반환 및 전역 세션 설정 */
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

  // 🚨 --- 'body'가 사라졌던 부분 --- 🚨
  // 'post' 함수에 보낼 데이터를 여기서 정의합니다.
  const body: any = { pwd };
  if (phone) body.phoneNum = phone;
  else if (email) body.email = email;
  else body.zzapID = zzapID;
  // 🚨 --- 여기까지 --- 🚨

  const res: any = await post("/api/v1/users/login", body, { skipAuth: true });

  const token =
    typeof res === "string"
      ? res
      : res?.accessToken ?? res?.token ?? res?.data?.accessToken ?? "";

  if (!token) throw new ApiError("로그인 응답에 토큰이 없습니다.", 500, res);

  const finalToken = String(token).trim().replace(/^"|"$/g, "");

  // 🚨 --- 수정된 부분 (expiresAtMs) --- 🚨
  try {
    // 2. 토큰을 파싱해서 만료 시간(exp)을 찾습니다.
    const payload = parseJwt(finalToken);
    const expSeconds = payload?.exp; // exp는 '초' 단위 UNIX 타임스탬프

    // 3. '밀리초' 단위로 변환합니다. (exp가 없으면 1시간 뒤로 설정)
    const expiresAtMs = expSeconds
      ? expSeconds * 1000
      : Date.now() + 3600 * 1000; // (fallback: 1 hour)

    // API 모듈에 즉시 토큰 설정
    setApiAuthToken(finalToken);

    // 4. 이제 두 번째 인자(만료 시간)와 함께 저장합니다.
    await saveTokenWithExpiry(finalToken, expiresAtMs);

    // 참고: authSession.ts의 onAuthChange 이벤트 트리거... (이하 동일)
  } catch (e) {
    console.error("[auth.ts] 로그인 후 토큰 저장/설정 실패", e);
  }
  // 🚨 --- 여기까지 --- 🚨

  return finalToken;
}
