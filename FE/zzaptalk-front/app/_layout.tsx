// app/_layout.tsx
import {
  Stack,
  usePathname,
  useRouter,
  useRootNavigationState,
} from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { restoreSession, onAuthChange } from "../src/lib/authSession";

/**
 * 개발 편의용: 로그인 우회 (환경변수로 제어)
 *  - EXPO_PUBLIC_DEV_BYPASS_LOGIN=1 이면 로그인 없이 /chat 접근 허용
 *  - 배포/실사용 시 0 또는 unset 권장
 */
const BYPASS = process.env.EXPO_PUBLIC_DEV_BYPASS_LOGIN === "1";

/** 공개 경로(로그인 없이 접근 가능) */
const PUBLIC = new Set<string>(["/login", "/signup"]);

// 우회 모드면 목록/친구/채팅도 공개로 취급(개발 편의)
if (BYPASS) ["/", "/chat", "/friends"].forEach((p) => PUBLIC.add(p));

/** 경로 정규화 */
const norm = (p: string) => {
  const q = p.split("?")[0].split("#")[0];
  return q === "/" ? "/" : q.replace(/\/+$/, "");
};

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const rootNav = useRootNavigationState();

  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const lastRedirect = useRef<string>("");

  // 웹에서 포커스 잔상 제거 (선택)
  useEffect(() => {
    if (Platform.OS !== "web") return;
    try {
      (document.activeElement as any)?.blur?.();
    } catch {}
  }, [pathname]);

  /** 세션 복구 & 로그인 상태 구독 */
  useEffect(() => {
    let alive = true;
    (async () => {
      const ok = await restoreSession(); // 저장된 토큰 복구 + axios 헤더 세팅
      if (!alive) return;
      setLoggedIn(BYPASS ? true : !!ok);
      setReady(true);
    })();
    const off = onAuthChange((v) => setLoggedIn(BYPASS ? true : v));
    return () => {
      alive = false;
      off();
    };
  }, []);

  /**
   * 라우팅 가드
   * - 미로그인: 로그인/회원가입만 허용 → 그 외는 /login 으로
   * - 로그인: 로그인/회원가입에 있으면 /chat 으로
   */
  useEffect(() => {
    if (!rootNav?.key || !ready) return;

    const curr = norm(pathname);
    let to: string | null = null;

    // 🔒 미로그인 보호 (우회 모드 제외)
    if (!loggedIn && !PUBLIC.has(curr)) {
      to = "/login";
    }

    // 🔓 로그인 후 로그인/회원가입 화면에 머무르면 채팅 목록으로
    if (loggedIn && (curr === "/login" || curr === "/signup")) {
      to = "/chat";
    }

    if (to && to !== curr && lastRedirect.current !== to) {
      lastRedirect.current = to;
      router.replace(to as any);
    }
  }, [rootNav?.key, ready, loggedIn, pathname, router]);

  return <Stack screenOptions={{ headerShown: false, freezeOnBlur: true }} />;
}
