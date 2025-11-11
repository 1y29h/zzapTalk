// app/chat/index.tsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter, type Href } from "expo-router";
import { getChatRoomList } from "../../src/services/chat";
import type { ChatRoomUserListItem } from "../../src/types/chat";

export default function ChatListScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<ChatRoomUserListItem[]>([]);
  const autoOpenedRef = useRef(false); // 자동 이동이 필요하면 1회만

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getChatRoomList();
      setRooms(data ?? []);
      // 🔸 자동 진입을 하고 싶다면 아래를 주석 해제 (단, 1회만)
      // if (!autoOpenedRef.current && data?.length) {
      //   autoOpenedRef.current = true;
      //   router.replace(`/chat/${data[0].roomId}` as Href);
      // }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const openRoom = (roomId: number) => {
    router.push(`/chat/${roomId}` as Href);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!rooms.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>채팅방이 없어요.</Text>
        <Pressable style={styles.reload} onPress={load}>
          <Text style={styles.reloadText}>새로고침</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={rooms}
      keyExtractor={(r) => String(r.roomId)}
      contentContainerStyle={{ padding: 12 }}
      renderItem={({ item }) => (
        <Pressable style={styles.item} onPress={() => openRoom(item.roomId)}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>
              {item.roomName || `방 ${item.roomId}`}
            </Text>
            {!!(item.lastMessageContent ?? item.lastMessage) && (
              <Text style={styles.preview} numberOfLines={1}>
                {item.lastMessageContent ?? item.lastMessage}
              </Text>
            )}
          </View>
          {!!item.unreadCount && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { fontSize: 16, color: "#666", marginBottom: 12 },
  reload: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#eee",
    borderRadius: 8,
  },
  reloadText: { color: "#333" },

  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e9ecef",
  },
  title: { fontSize: 16, fontWeight: "600", color: "#111" },
  preview: { marginTop: 2, color: "#666" },

  badge: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#6b5cf6",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: { color: "#fff", fontSize: 13, fontWeight: "700" },
});
