// app/_layout.tsx
import { Stack, usePathname, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { View, ActivityIndicator, Platform } from "react-native";
import { Helmet } from "react-helmet";
import { restoreSession, onAuthChange } from "../src/lib/authSession";

const PUBLIC_PATHS = new Set<string>(["/login", "/signup"]);
const norm = (p: string) => {
  const q = p.split("?")[0].split("#")[0];
  if (q === "/") return "/";
  return q.replace(/\/+$/, "");
};

// 라우트 변경 시 웹에서 남은 포커스 강제 해제 (aria-hidden 이슈 방지)
function useWebBlurOnRouteChange(pathname: string) {
  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      (document.activeElement as HTMLElement | null)?.blur?.();
    }
  }, [pathname]);
}

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const lastRedirect = useRef<string>("");

  useWebBlurOnRouteChange(pathname);

  useEffect(() => {
    let alive = true;
    const path = norm(pathname);

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
            router.replace("/"); // 채팅 목록 루트
          }
        }
      } catch {
        if (!alive) return;
        setReady(true);
        if (!PUBLIC_PATHS.has(path) && lastRedirect.current !== "/login") {
          lastRedirect.current = "/login";
          router.replace("/login");
        }
      }
    })();

    // ✅ onAuthChange 콜백에서는 훅 사용 금지 -> location.pathname 사용
    const off = onAuthChange((isLoggedIn) => {
      const p = norm(
        (Platform.OS === "web" && typeof window !== "undefined"
          ? window.location.pathname
          : pathname) || "/"
      );
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
