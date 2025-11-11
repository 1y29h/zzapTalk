// app/screens/LoginScreen.tsx
import { useRouter } from "expo-router";
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
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../../src/styles/loginsignup/Login.module";
import { login } from "../../src/services/auth";
import { startSession } from "../../src/lib/authSession";
import { ApiError } from "../../src/lib/api";

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
  }, [errorMsg, fadeAnim]);

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

  // LoginScreen.tsx의 onSubmit 함수 (올바른 수정안)

  const onSubmit = async () => {
    if (!canSubmit) return;
    setErrorMsg(null);
    setLoading(true);
    try {
      Keyboard.dismiss();
      // ... (키보드 숨기기) ...

      const payload = {
        phoneNum: phone.replace(/\D/g, ""),
        pwd: password.trim(),
      };

      const response = await login(payload); // startSession이 토큰 저장과 setApiAuthToken을 모두 처리

      await startSession(response.accessToken, response.expiresIn); // 🛑 [수정] // "/" (로그인 화면)이 아니라 "/chat" (채팅 목록)으로 이동

      //router.replace("/chat");
    } catch (err) {
      console.error("로그인 API 실패:", err); // 👈 [추천] 서버 에러 메시지(예: "비밀번호 불일치")를 그대로 표시
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("로그인에 실패했습니다. 다시 시도해주세요.");
      }
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
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingTop: 56,
              paddingHorizontal: 20,
              paddingBottom: 40,
              justifyContent: "flex-start",
            }}
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.logoHeader} pointerEvents="none">
              <Image
                source={require("../../src/assets/images/loginlog.png")}
                style={styles.logoImg}
                resizeMode="contain"
              />
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>전화번호</Text>
              <TextInput
                value={phone}
                onChangeText={(v) => setPhone(formatPhone(v))}
                keyboardType={Platform.OS === "web" ? "default" : "phone-pad"}
                inputMode="numeric"
                placeholder="010-0000-0000"
                placeholderTextColor="#b7b7b7"
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={13}
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
