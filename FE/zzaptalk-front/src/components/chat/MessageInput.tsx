import { Feather, Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  NativeSyntheticEvent,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";
import styles from "../../styles/chat/MessageInput.module";

// 웹 키 이벤트(간단 버전): key + (웹에서만 존재할 수 있는) shiftKey
type WebKeyEvent = NativeSyntheticEvent<
  { key: string } & { shiftKey?: boolean }
>;

export default function MessageInput({
  onSend,
}: {
  onSend: (t: string) => void;
}) {
  const [text, setText] = useState("");

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
  };

  const handleKeyPress = (e: WebKeyEvent) => {
    if (
      Platform.OS === "web" &&
      e.nativeEvent.key === "Enter" &&
      !e.nativeEvent.shiftKey
    ) {
      e.preventDefault?.();
      submit();
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.circleBtn}>
        <Ionicons name="add" size={22} color="#222" />
      </Pressable>

      <Pressable style={styles.circleBtn}>
        <Feather name="smile" size={20} color="#111" />
      </Pressable>

      <View style={styles.inputWrap}>
        <TextInput
          value={text}
          onChangeText={setText}
          style={styles.input}
          placeholder="메세지 입력"
          placeholderTextColor="#b5b5b5"
          multiline
          onKeyPress={handleKeyPress} // ← 여기서 사용
        />
        <Pressable style={styles.sendFab} onPress={submit}>
          <Ionicons name="send" size={16} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}
