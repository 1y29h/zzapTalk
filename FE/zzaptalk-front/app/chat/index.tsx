import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";

export default function ChatEntryScreen() {
  const router = useRouter();

  const goGroup = () => router.push("/chat/group" as Href);
  const goPersonal = () => router.push("/chat/personal" as Href);

  return (
    <View style={s.container}>
      <Text style={s.header}>채팅</Text>

      <View style={s.cardWrap}>
        <Pressable style={[s.card, s.shadow]} onPress={goGroup}>
          <Feather name="users" size={34} color="#6b5cf6" />
          <Text style={s.title}>단체 채팅방 입장</Text>
          <Text style={s.desc}>여러 명과 함께 대화하기</Text>
        </Pressable>

        <Pressable style={[s.card, s.shadow]} onPress={goPersonal}>
          <Ionicons name="person-circle-outline" size={36} color="#6b5cf6" />
          <Text style={s.title}>개인챗 입장</Text>
          <Text style={s.desc}>1:1 대화 시작하기</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    paddingTop: 70,
  },
  header: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 30,
    color: "#111",
  },
  cardWrap: {
    width: "85%",
    gap: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
    marginTop: 10,
  },
  desc: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
});
