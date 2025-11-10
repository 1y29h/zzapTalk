// app/chat/index.tsx
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  Text,
  View,
  Pressable,
  SafeAreaView,
} from "react-native";
import {
  fetchGroupRooms,
  fetchSingleRooms,
  Room,
} from "../../src/services/chat";
import styles from "../../src/styles/chat/ChatList.module";

export default function ChatListScreen() {
  const router = useRouter();
  const [groups, setGroups] = useState<Room[]>([]);
  const [singles, setSingles] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [g, s] = await Promise.all([fetchGroupRooms(), fetchSingleRooms()]);
      setGroups(g);
      setSingles(s);
    } catch (e: any) {
      setError(e?.message ?? "불러오기에 실패했어요.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const sections = useMemo(
    () => [
      { title: "👥 단체 채팅방", data: groups, type: "group" as const },
      { title: "💬 개인 채팅방", data: singles, type: "single" as const },
    ],
    [groups, singles]
  );

  const goRoom = (room: Room, type: "group" | "single") => {
    if (type === "group") {
      router.push({
        pathname: "/chat/[id]",
        params: { id: room.id, type: "group", title: room.title },
      });
    } else {
      router.push({
        pathname: "/chat/[id]",
        params: { id: room.id, title: room.title },
      });
    }
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {error ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>다시 시도</Text>
          </Pressable>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionTitle}>{section.title}</Text>
          )}
          renderItem={({ item, section }) => (
            <Pressable
              style={styles.row}
              onPress={() => goRoom(item, section.type)}
            >
              <View style={styles.rowTextWrap}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                {!!item.lastMessage && (
                  <Text style={styles.rowSub} numberOfLines={1}>
                    {item.lastMessage}
                  </Text>
                )}
              </View>
              {item.unreadCount ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {item.unreadCount > 99 ? "99+" : item.unreadCount}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          stickySectionHeadersEnabled
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centerBox}>
              <Text style={styles.emptyText}>채팅방이 없어요.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
