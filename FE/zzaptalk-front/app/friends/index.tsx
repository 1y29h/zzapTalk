import React from "react";
import { View, Text } from "react-native";
import BottomTabs from "../../src/components/BottomTabs";

export default function FriendsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View
        style={{
          height: 56,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#f1f5f9",
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "700", color: "#111" }}>
          친구
        </Text>
      </View>

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>친구 목록(추가 예정)</Text>
      </View>

      <BottomTabs />
    </View>
  );
}
