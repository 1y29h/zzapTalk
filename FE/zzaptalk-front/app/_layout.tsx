import {
  Stack,
  usePathname,
  useRouter,
  useRootNavigationState,
  type Href,
} from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { restoreSession, onAuthChange } from "../src/lib/authSession";

const PUBLIC = new Set<string>(["/login", "/signup"]);

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

  // 웹 경고 예방: 경로가 바뀔 때 포커스 해제
  useEffect(() => {
    if (Platform.OS !== "web") return;
    try {
      (document.activeElement as HTMLElement | null)?.blur?.();
    } catch {}
  }, [pathname]); // ← onStateChange 대신 pathname 변경으로 대체

  // 안전 replace
  const safeReplace = (to: string) => {
    if (Platform.OS === "web") {
      try {
        (document.activeElement as HTMLElement | null)?.blur?.();
      } catch {}
    }
    router.replace(to as Href);
  };

  // 세션 복구 + 로그인 상태 구독
  useEffect(() => {
    let alive = true;
    (async () => {
      const ok = await restoreSession();
      if (!alive) return;
      setLoggedIn(!!ok);
      setReady(true);
    })();
    const off = onAuthChange((v) => setLoggedIn(v));
    return () => {
      alive = false;
      off();
    };
  }, []);

  // 가드
  useEffect(() => {
    if (!rootNav?.key) return; // 네비 준비 전 이동 금지
    if (!ready) return;

    const curr = norm(pathname);
    let to: string | null = null;

    if (!loggedIn && !PUBLIC.has(curr)) to = "/login";
    if (loggedIn && PUBLIC.has(curr)) to = "/";

    if (to && to !== curr && lastRedirect.current !== to) {
      lastRedirect.current = to;
      safeReplace(to);
    }
  }, [rootNav?.key, ready, loggedIn, pathname]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // 지원되는 옵션만 사용
        freezeOnBlur: true,
      }}
    />
  );
}
