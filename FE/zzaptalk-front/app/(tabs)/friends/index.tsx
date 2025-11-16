// app/(tabs)/friends/index.tsx
import React, { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import styles from "../../../src/styles/friends/Friends.module";

type Friend = {
  id: number;
  name: string;
};

const MY_NAME = "김민서";

export default function FriendsScreen() {
  const [friends] = useState<Friend[]>([
    { id: 1, name: "친구 1" },
    { id: 2, name: "친구 2" },
  ]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerLeft} />
          <Text style={styles.headerTitle}>친구</Text>
          <View style={styles.headerRight}>
            <Ionicons name="search" size={20} style={styles.headerIcon} />
            <Ionicons
              name="person-add-outline"
              size={20}
              style={styles.headerIcon}
            />
            <Ionicons
              name="settings-outline"
              size={20}
              style={styles.headerIcon}
            />
          </View>
        </View>

        {/* 내 프로필 */}
        <View style={styles.myProfileSection}>
          <View style={styles.myProfileAvatar} />
          <Text style={styles.myProfileName}>{MY_NAME}</Text>
        </View>

        {/* 구분선 */}
        <View style={styles.divider} />

        {/* 친구 수 */}
        <View style={styles.friendCountRow}>
          <Text style={styles.friendCountLabel}>친구 수</Text>
          <Text style={styles.friendCountValue}>{friends.length}</Text>
        </View>

        {/* 친구 리스트 */}
        <FlatList
          data={friends}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.friendList}
          renderItem={({ item }) => (
            <Pressable style={styles.friendRow}>
              <View style={styles.friendAvatar}>
                <Text style={styles.friendAvatarInitial}>
                  {item.name.charAt(0)}
                </Text>
              </View>
              <Text style={styles.friendName}>{item.name}</Text>
            </Pressable>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
