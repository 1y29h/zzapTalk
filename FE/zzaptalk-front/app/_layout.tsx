// app/_layout.tsx
import {
  Stack,
  usePathname,
  useRouter,
  useRootNavigationState,
  type Href,
} from "expo-router";
import { useEffect, useRef, useState } from "react";
import { restoreSession, onAuthChange } from "../src/lib/authSession";

const PUBLIC = new Set<string>(["/login", "/signup"]); // 로그인 전 접근 허용

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

  useEffect(() => {
    if (!rootNav?.key) return; // ✅ 루트 네비 준비 전 이동 금지
    if (!ready) return;

    const curr = norm(pathname);
    let to: string | null = null;

    if (!loggedIn && !PUBLIC.has(curr)) to = "/login";
    if (loggedIn && PUBLIC.has(curr)) to = "/chat";

    if (to && to !== curr && lastRedirect.current !== to) {
      lastRedirect.current = to;
      router.replace(to as Href);
    }
  }, [rootNav?.key, ready, loggedIn, pathname, router]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
