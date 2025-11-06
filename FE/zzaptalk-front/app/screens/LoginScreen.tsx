import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../../src/styles/loginsignup/Login.module";

// 010-0000-0000 포맷터
const formatPhone = (raw: string) => {
  const only = raw.replace(/\D/g, "").slice(0, 11);
  if (only.length < 4) return only;
  if (only.length < 8) return `${only.slice(0, 3)}-${only.slice(3)}`;
  return `${only.slice(0, 3)}-${only.slice(3, 7)}-${only.slice(7)}`;
};

// 소형 체크박스
function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <Pressable style={styles.checkboxRow} onPress={() => onChange(!checked)}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <View style={styles.checkboxDot} />}
      </View>
      {label ? <Text style={styles.checkboxLabel}>{label}</Text> : null}
    </Pressable>
  );
}

export default function LoginScreen() {
  const router = useRouter();

  const [phone, setPhone] = useState(""); //usestate 상태관리
  const [password, setPassword] = useState("");
  const [autoLogin, setAutoLogin] = useState(false);

  const canSubmit = useMemo(() => {
    //useMemo 성능 최적화
    const phoneOk = /^\d{3}-\d{3,4}-\d{4}$/.test(phone);
    return phoneOk && password.length > 0;
  }, [phone, password]);

  const onChangePhone = (v: string) => setPhone(formatPhone(v));

  const onSubmit = () => {
    if (!canSubmit) return;
    // TODO: 실제 로그인 API
    Alert.alert(
      "로그인",
      `전화번호: ${phone}\n자동로그인: ${autoLogin ? "ON" : "OFF"}`
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={styles.container}
    >
      {/* 상단 안전영역 */}
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        {/* 로고 (카메라/상태바 아래) */}
        <View style={styles.logoHeader}>
          <Image
            source={require("../../src/assets/images/loginlog.png")}
            style={styles.logoImg}
          />
        </View>

        {/* 폼 */}
        <View style={styles.form}>
          <Text style={styles.label}>전화번호</Text>
          <TextInput
            value={phone}
            onChangeText={onChangePhone}
            keyboardType="number-pad"
            placeholder="010-0000-0000"
            placeholderTextColor="#b7b7b7"
            style={styles.input}
            returnKeyType="next"
          />

          <Text style={[styles.label, { marginTop: 16 }]}>비밀번호</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="비밀번호"
            placeholderTextColor="#b7b7b7"
            secureTextEntry
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={onSubmit}
          />

          <Checkbox
            checked={autoLogin}
            onChange={setAutoLogin}
            label="자동 로그인"
          />

          <Pressable
            style={[styles.loginBtn, !canSubmit && styles.loginBtnDisabled]}
            onPress={onSubmit}
            disabled={!canSubmit}
          >
            <Text style={styles.loginBtnText}>로그인</Text>
          </Pressable>

          {/* 하단 링크 */}
          <View style={styles.linksRow}>
            <Pressable onPress={() => Alert.alert("아이디 찾기")} hitSlop={8}>
              <Text style={styles.linkText}>아이디 찾기</Text>
            </Pressable>
            <View style={styles.dot} />
            <Pressable onPress={() => Alert.alert("비밀번호 찾기")} hitSlop={8}>
              <Text style={styles.linkText}>비밀번호 찾기</Text>
            </Pressable>
            <View style={styles.dot} />
            <Pressable onPress={() => router.push("/signup")} hitSlop={8}>
              <Text style={styles.linkText}>회원가입</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
