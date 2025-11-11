import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>채팅방 선택</Text>

      {/* 개인 채팅방 입장 */}
      <Pressable
        style={styles.btn}
        onPress={() => router.push("/chat/personal")}
      >
        <Text style={styles.btnText}>개인 채팅방 입장</Text>
      </Pressable>

      {/* 단체 채팅방 입장 */}
      <Pressable style={styles.btn} onPress={() => router.push("/chat")}>
        <Text style={styles.btnText}>단체 채팅방 입장</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 40,
  },
  btn: {
    backgroundColor: "#cfc7ff",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginVertical: 10,
  },
  btnText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
});
