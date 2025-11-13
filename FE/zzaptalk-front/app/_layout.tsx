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
import { useFonts } from "expo-font";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { View, ActivityIndicator } from "react-native";
import "../global-icons.css"; // 또는 "../global.css"

/** 로그인 없이 접근 가능한 공개 경로 */
const PUBLIC = new Set<string>(["/login", "/signup"]);

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

  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    ...MaterialIcons.font,
  });

  // (선택) 웹에서 포커스 잔상 제거
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
      const ok = await restoreSession(); // 토큰 복원 + axios Authorization 세팅
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

  /** 라우팅 가드 */
  useEffect(() => {
    if (!rootNav?.key || !ready) return;

    const curr = norm(pathname);
    let to: string | null = null;

    // 🔒 미로그인: 공개 경로만 허용
    if (!loggedIn && !PUBLIC.has(curr)) {
      to = "/login";
    }

    // 🔓 로그인 후 로그인/회원가입에 있으면 채팅으로
    if (loggedIn && (curr === "/login" || curr === "/signup")) {
      to = "/chat";
    }

    if (to && to !== curr && lastRedirect.current !== to) {
      lastRedirect.current = to;
      router.replace(to as any);
    }
  }, [rootNav?.key, ready, loggedIn, pathname, router]);

  if (!fontsLoaded || !ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false, freezeOnBlur: true }} />;
}
