// app/_layout.tsx
import { Stack, usePathname, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { restoreSession, onAuthChange } from "../src/lib/authSession";
import { View, ActivityIndicator } from "react-native";

// ✅ 로그인 없이 접근 가능한 공개 경로
const PUBLIC_PATHS = new Set<string>(["/login", "/signup"]);

// ✅ 경로 정규화: 뒤 슬래시 제거(/ → / 그대로 유지)
const norm = (p: string) => {
  const q = p.split("?")[0].split("#")[0]; // 쿼리/해시 제거
  if (q === "/") return "/";
  return q.replace(/\/+$/, "");
};

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const lastRedirect = useRef<string>(""); // ✅ 같은 경로로 반복 replace 방지

  useEffect(() => {
    let alive = true;
    const path = norm(pathname); // ✅ 항상 정규화해서 사용

    (async () => {
      try {
        const loggedIn = await restoreSession();
        if (!alive) return;

        setReady(true);

        if (!loggedIn) {
          if (!PUBLIC_PATHS.has(path) && lastRedirect.current !== "/login") {
            lastRedirect.current = "/login";
            router.replace("/login");
          }
        } else {
          if (PUBLIC_PATHS.has(path) && lastRedirect.current !== "/") {
            lastRedirect.current = "/";
            router.replace("/"); // TODO: 목록 나오면 "/chat/list"
          }
        }
      } catch (e) {
        if (!alive) return;
        setReady(true);
        if (!PUBLIC_PATHS.has(path) && lastRedirect.current !== "/login") {
          lastRedirect.current = "/login";
          router.replace("/login");
        }
      }
    })();

    const off = onAuthChange((isLoggedIn) => {
      const p = norm(usePathname()); // 최신 경로로 다시 정규화
      if (isLoggedIn) {
        if (PUBLIC_PATHS.has(p) && lastRedirect.current !== "/") {
          lastRedirect.current = "/";
          router.replace("/");
        }
      } else {
        if (!PUBLIC_PATHS.has(p) && lastRedirect.current !== "/login") {
          lastRedirect.current = "/login";
          router.replace("/login");
        }
      }
    });

    return () => {
      alive = false;
      off();
    };
  }, [router, pathname]);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <Helmet>
        <link rel="stylesheet" href="/global-icons.css" />
        <link rel="icon" href="/favicon.png" />
      </Helmet>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="chat/[id]" />
      </Stack>
    </>
  );
}
