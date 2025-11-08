import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
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
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [autoLogin, setAutoLogin] = useState(false);

  const canSubmit = useMemo(() => {
    const phoneOk = /^\d{3}-\d{3,4}-\d{4}$/.test(phone);
    return phoneOk && password.length > 0;
  }, [phone, password]);

  const onChangePhone = (v: string) => setPhone(formatPhone(v));

  const onSubmit = () => {
    if (!canSubmit) return;
    router.push({
      pathname: "/chat/[id]",
      params: { id: "room1" },
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={styles.container}
    >
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        {/* ✅ 여기서부터 ScrollView로 전체 감싸기 */}
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: 56,
            paddingHorizontal: 20,
            paddingBottom: 40,
            justifyContent: "flex-start",
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={
            Platform.OS === "web" ? ({ overflowY: "auto" } as any) : undefined
          }
        >
          {/* 로고 */}
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
              <Pressable
                onPress={() => Alert.alert("비밀번호 찾기")}
                hitSlop={8}
              >
                <Text style={styles.linkText}>비밀번호 찾기</Text>
              </Pressable>
              <View style={styles.dot} />
              <Pressable onPress={() => router.push("/signup")} hitSlop={8}>
                <Text style={styles.linkText}>회원가입</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
        {/* ✅ ScrollView 닫힘 */}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
