// app/index.tsx
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { restoreSession, onAuthChange } from "../src/lib/authSession";

export default function IndexGate() {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

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

  if (!ready) return null;

  return <Redirect href={loggedIn ? "/chat" : "/login"} />;
}
