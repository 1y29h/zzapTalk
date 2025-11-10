// app/screens/LoginScreen.tsx
import { useRouter, Href } from "expo-router";
import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
  Keyboard,
  ScrollView,
  Pressable, // 버튼에만 사용
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../../src/styles/loginsignup/Login.module";
import { login } from "../../src/services/auth";
import { startSession } from "../../src/lib/authSession";

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 에러 메시지 페이드인
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (errorMsg) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: Platform.OS !== "web",
      }).start();
    }
  }, [errorMsg]);

  const formatPhone = (raw: string) => {
    const only = raw.replace(/\D/g, "").slice(0, 11);
    if (only.length < 4) return only;
    if (only.length < 8) return `${only.slice(0, 3)}-${only.slice(3)}`;
    return `${only.slice(0, 3)}-${only.slice(3, 7)}-${only.slice(7)}`;
  };

  const canSubmit = useMemo(() => {
    const phoneOk = /^\d{3}-\d{3,4}-\d{4}$/.test(phone);
    return phoneOk && password.trim().length > 0 && !loading;
  }, [phone, password, loading]);

  const onSubmit = async () => {
    if (!canSubmit) return;
    setErrorMsg(null);
    setLoading(true);
    try {
      Keyboard.dismiss();
      if (Platform.OS === "web" && typeof document !== "undefined") {
        (document.activeElement as HTMLElement | null)?.blur?.();
      }

      const payload = {
        phoneNum: phone.replace(/\D/g, ""),
        pwd: password.trim(),
      };

      // 서버 응답 문자열(JWT) 정리
      const raw = await login(payload);
      const jwt = String(raw).trim().replace(/^"|"$/g, "");

      await startSession(jwt);

      // 채팅 목록으로 이동 (타입 안전)
      router.replace("/chat" as Href); // app/chat/index.tsx
    } catch {
      setErrorMsg("로그인에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={styles.container}
    >
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        {/* ✅ 바깥을 누르면 키보드는 닫되, 입력 포커스는 방해하지 않게 Pressable 래퍼 제거 */}
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingTop: 56,
              paddingHorizontal: 20,
              paddingBottom: 40,
              justifyContent: "flex-start",
            }}
            // ✅ 입력란 클릭 시 포커스 유지
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}
          >
            {/* 로고(터치 이벤트 차단은 prop로) */}
            <View style={styles.logoHeader} pointerEvents="none">
              <Image
                source={require("../../src/assets/images/loginlog.png")}
                style={styles.logoImg}
                resizeMode="contain" // ⚠️ style이 아니라 prop로 지정
              />
            </View>

            {/* 폼 */}
            <View style={styles.form}>
              <Text style={styles.label}>전화번호</Text>
              <TextInput
                value={phone}
                onChangeText={(v) => setPhone(formatPhone(v))}
                keyboardType={Platform.OS === "web" ? "default" : "phone-pad"} // 웹 숫자입력 문제 회피
                inputMode="numeric" // 숫자 키패드 유도(웹 지원)
                placeholder="010-0000-0000"
                placeholderTextColor="#b7b7b7"
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={13} // 010-0000-0000
                editable
              />

              <Text style={[styles.label, { marginTop: 16 }]}>비밀번호</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="비밀번호"
                placeholderTextColor="#b7b7b7"
                secureTextEntry
                style={styles.input}
                onSubmitEditing={onSubmit}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                editable
              />

              {/* 에러 메시지 */}
              {errorMsg && (
                <Animated.View style={{ opacity: fadeAnim, marginTop: 10 }}>
                  <Text
                    style={{
                      color: "#ff4d4d",
                      fontSize: 14,
                      textAlign: "center",
                      lineHeight: 18,
                    }}
                  >
                    {errorMsg}
                  </Text>
                </Animated.View>
              )}

              <Pressable
                style={[styles.loginBtn, !canSubmit && styles.loginBtnDisabled]}
                onPress={onSubmit}
                disabled={!canSubmit}
              >
                <Text style={styles.loginBtnText}>
                  {loading ? "로그인 중..." : "로그인"}
                </Text>
              </Pressable>

              {/* 하단 링크 */}
              <View style={styles.linksRow}>
                <Pressable onPress={() => alert("아이디 찾기")} hitSlop={8}>
                  <Text style={styles.linkText}>아이디 찾기</Text>
                </Pressable>
                <View style={styles.dot} />
                <Pressable onPress={() => alert("비밀번호 찾기")} hitSlop={8}>
                  <Text style={styles.linkText}>비밀번호 찾기</Text>
                </Pressable>
                <View style={styles.dot} />
                <Pressable onPress={() => router.push("/signup")} hitSlop={8}>
                  <Text style={styles.linkText}>회원가입</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
