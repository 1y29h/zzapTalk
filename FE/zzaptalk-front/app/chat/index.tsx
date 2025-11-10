import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { api } from "../../src/lib/api"; // axios 인스턴스
import styles from "../../src/styles/chat/ChatList.module.css";

// 백엔드에서 받을 데이터 타입 (원하는 대로 수정 가능)
type Room = {
  id: string | number;
  name: string;
  avatarUrl?: string;
  lastMsg?: string;
  lastAt?: string | number;
  unread?: number;
};

export default function ChatListScreen() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** 🔄 목록 불러오기 */
  const fetchRooms = useCallback(async () => {
    setError(null);
    try {
      setLoading(true);
      const { data } = await api.get<Room[]>("/api/chat/rooms", {
        params: q ? { q } : undefined,
      });
      setRooms(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message ?? "목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  /** 새로고침 */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRooms();
    setRefreshing(false);
  }, [fetchRooms]);

  /** 개별 아이템 */
  const renderItem = ({ item }: { item: Room }) => (
    <Pressable
      onPress={() => router.push(`/chat/${item.id}`)}
      style={({ pressed }) => [
        styles.item as any,
        pressed && { opacity: 0.7, backgroundColor: "rgba(0,0,0,0.02)" },
      ]}
    >
      <Avatar name={item.name} uri={item.avatarUrl} />
      <View style={styles.center as any}>
        <View style={styles.nameRow as any}>
          <Text style={styles.name as any} numberOfLines={1}>
            {item.name}
          </Text>
          {item.unread && item.unread > 0 && (
            <View style={styles.badge as any}>
              <Text style={styles.badgeText as any}>
                {item.unread > 99 ? "99+" : item.unread}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.lastMsg as any} numberOfLines={1}>
          {item.lastMsg || "대화를 시작해보세요"}
        </Text>
      </View>

      <Text style={styles.time as any}>{formatTime(item.lastAt)}</Text>
    </Pressable>
  );

  return (
    <View style={styles.root as any}>
      {/* 헤더 */}
      <View style={styles.header as any}>
        <Text style={styles.title as any}>채팅</Text>
      </View>

      {/* 검색창 */}
      <View style={styles.searchWrap as any}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="검색"
          returnKeyType="search"
          onSubmitEditing={fetchRooms}
          style={styles.search as any}
        />
        <Pressable onPress={fetchRooms} style={styles.searchBtn as any}>
          <Text style={styles.searchBtnText as any}>검색</Text>
        </Pressable>
      </View>

      {/* 본문 */}
      {loading ? (
        <View style={styles.centerEmpty as any}>
          <ActivityIndicator />
        </View>
      ) : error ? (
        <View style={styles.centerEmpty as any}>
          <Text style={styles.errText as any}>{error}</Text>
          <Pressable onPress={fetchRooms} style={styles.retryBtn as any}>
            <Text style={styles.retryText as any}>다시 시도</Text>
          </Pressable>
        </View>
      ) : rooms.length === 0 ? (
        <View style={styles.centerEmpty as any}>
          <Text style={styles.emptyText as any}>대화방이 없습니다</Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(it) => String(it.id)}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.sep as any} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      )}
    </View>
  );
}

/** 아바타 (이미지 or 이니셜) */
function Avatar({ name, uri }: { name: string; uri?: string }) {
  const initials = (name || "")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (uri) {
    return <Image source={{ uri }} style={styles.avatar as any} />;
  }
  return (
    <View style={[styles.avatar as any, styles.avatarFallback as any]}>
      <Text style={styles.avatarText as any}>{initials || "?"}</Text>
    </View>
  );
}

/** 시간 포맷 */
function formatTime(t?: string | number) {
  if (!t) return "";
  const d = typeof t === "number" ? new Date(t) : new Date(String(t));
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  if (sameDay) {
    const hh = d.getHours();
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ap = hh < 12 ? "오전" : "오후";
    const h12 = hh % 12 || 12;
    return `${ap} ${h12}:${mm}`;
  }
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
