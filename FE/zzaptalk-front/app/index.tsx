// app/index.tsx
import React, { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { View, ActivityIndicator, Platform } from "react-native";
import { restoreSession, onAuthChange } from "../src/lib/authSession";

export default function IndexGate() {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let alive = true;

    // 1) 앱 진입 시 저장된 토큰 복원 → axios Authorization 세팅
    (async () => {
      const ok = await restoreSession();
      if (!alive) return;
      setLoggedIn(!!ok);
      setReady(true);
    })();

    // 2) 로그인/로그아웃 상태 변화 구독
    const off = onAuthChange((v) => setLoggedIn(v));

    return () => {
      alive = false;
      off();
    };
  }, []);

  // app/index.tsx (로딩 화면 부분만 발췌)
  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  // 로그인 여부에 따라 분기
  return <Redirect href={loggedIn ? "/chat" : "/login"} />;
}
