import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
  Alert,
  Platform,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import listStyles from "../../src/styles/chat/ChatList.module";
import BottomTabs from "../../src/components/BottomTabs";

import {
  getChatRoomList,
  createOrGetSingleChatRoom,
  createGroupChatRoom,
} from "../../src/services/chat";
import type { ChatRoomUserListItem } from "../../src/types/chat";

export default function ChatListScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<ChatRoomUserListItem[]>([]);
  const [query, setQuery] = useState("");
  const [openSearch, setOpenSearch] = useState(false);

  // 생성 시트 상태
  const [openCreate, setOpenCreate] = useState(false);
  const [tab, setTab] = useState<"direct" | "group">("direct");
  const [targetUserId, setTargetUserId] = useState<string>(""); // direct
  const [groupTitle, setGroupTitle] = useState<string>(""); // group
  const [invitedIds, setInvitedIds] = useState<string>(""); // "2,3,5"

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getChatRoomList();
      setRooms(res || []);
    } catch (e: any) {
      Alert.alert("오류", e?.message || "채팅 목록을 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter((r) => (r.roomName || "").toLowerCase().includes(q));
  }, [rooms, query]);

  /** ✅ 방으로 이동할 때 제목까지 같이 넘기기 */
  const goRoom = (roomId: number, roomTitle?: string | null) =>
    router.push({
      pathname: "/chat/[id]",
      params: {
        id: String(roomId),
        ...(roomTitle ? { title: roomTitle } : {}),
      },
    } as Href);

  /** 개인 채팅 생성 */
  const submitDirect = async () => {
    const n = Number(targetUserId);
    if (!Number.isFinite(n)) {
      Alert.alert("잘못된 입력", "상대 사용자 ID는 숫자여야 해요.");
      return;
    }
    try {
      const room = await createOrGetSingleChatRoom(n);

      setOpenCreate(false);
      setTargetUserId("");

      const roomId = (room as any)?.roomId;
      const roomTitle =
        (room as any)?.roomName ||
        (room as any)?.targetNickname ||
        (roomId ? `채팅방 ${roomId}` : undefined);

      if (roomId) {
        //먼저 방으로 이동 (제목 포함)
        goRoom(roomId, roomTitle);
        //목록 새로고침은 뒤로 미룸(네비 영향 X)
        setTimeout(() => {
          load().catch(() => {});
        }, 0);
      }
    } catch (e: any) {
      Alert.alert("생성 실패", e?.message || "개인 채팅방을 만들 수 없어요.");
    }
  };

  /** 그룹 채팅 생성 */
  const submitGroup = async () => {
    // "2,3,5" -> [2,3,5]
    const ids = invitedIds
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n)) as number[];

    try {
      const room = await createGroupChatRoom(groupTitle.trim() || null, ids);

      setOpenCreate(false);
      setGroupTitle("");
      setInvitedIds("");

      const roomId = room?.roomId ?? (room as any)?.roomId;
      const roomTitle =
        groupTitle.trim() ||
        room?.roomName ||
        (roomId ? `채팅방 ${roomId}` : undefined);

      if (roomId) {
        // ✅ 먼저 이동 (제목 포함)
        goRoom(roomId, roomTitle);
        // ✅ 목록은 비동기 갱신
        setTimeout(() => {
          load().catch(() => {});
        }, 0);
      }
    } catch (e: any) {
      Alert.alert("생성 실패", e?.message || "단체 채팅방을 만들 수 없어요.");
    }
  };

  const renderItem = ({ item }: { item: ChatRoomUserListItem }) => (
    <Pressable
      onPress={() => goRoom(item.roomId, item.roomName || null)}
      style={listStyles.row}
    >
      <View style={listStyles.avatar}>
        <Text style={listStyles.avatarLetter}>
          {(item.roomName || "채팅").slice(0, 1)}
        </Text>
      </View>
      <View style={listStyles.rowTextWrap}>
        <Text style={listStyles.rowTitle}>{item.roomName || "채팅방"}</Text>
        {!!item.lastMessage && (
          <Text numberOfLines={1} style={listStyles.rowSub}>
            {item.lastMessage}
          </Text>
        )}
      </View>
      {!!item.unreadCount && item.unreadCount > 0 ? (
        <View style={listStyles.badge}>
          <Text style={listStyles.badgeText}>{item.unreadCount}</Text>
        </View>
      ) : null}
    </Pressable>
  );

  return (
    <View style={listStyles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <View style={{ width: 44 }} />
        <Text style={styles.headerTitle}>채팅</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable
            onPress={() => setOpenSearch((v) => !v)}
            style={styles.iconBtn}
          >
            <Ionicons name="search" size={20} color="#111" />
          </Pressable>
          <Pressable onPress={() => setOpenCreate(true)} style={styles.iconBtn}>
            <Ionicons name="add-circle" size={22} color="#7C74FF" />
          </Pressable>
        </View>
      </View>

      {/* 검색 입력 */}
      {openSearch && (
        <View
          style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 }}
        >
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#6b7280" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="대화 검색"
              placeholderTextColor="#9CA3AF"
              style={{ marginLeft: 8, flex: 1, color: "#111" }}
              returnKeyType="search"
            />
            {!!query && (
              <Pressable onPress={() => setQuery("")}>
                <Ionicons name="close" size={16} color="#6b7280" />
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* 목록 */}
      {loading ? (
        <View style={listStyles.centerBox}>
          <ActivityIndicator />
        </View>
      ) : filtered.length === 0 ? (
        <View style={listStyles.centerBox}>
          <Text style={listStyles.emptyText}>채팅방이 없어요.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(x) => String(x.roomId)}
          ItemSeparatorComponent={() => <View style={listStyles.sep} />}
          contentContainerStyle={listStyles.listContent}
        />
      )}

      {/* 생성 시트 */}
      <Modal
        transparent
        visible={openCreate}
        animationType="fade"
        onRequestClose={() => setOpenCreate(false)}
      >
        <View style={styles.sheetOverlay}>
          {/* 배경만 닫기 */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setOpenCreate(false)}
          />
          {/* 시트: 내부 터치 흡수 */}
          <View onStartShouldSetResponder={() => true} style={styles.sheet}>
            {/* 탭 버튼 */}
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
              <Pressable
                onPress={() => setTab("direct")}
                style={[
                  styles.tab,
                  { backgroundColor: tab === "direct" ? "#EEF0FF" : "#F5F6F7" },
                ]}
              >
                <Text style={styles.tabText}>개인 채팅</Text>
              </Pressable>
              <Pressable
                onPress={() => setTab("group")}
                style={[
                  styles.tab,
                  { backgroundColor: tab === "group" ? "#EEF0FF" : "#F5F6F7" },
                ]}
              >
                <Text style={styles.tabText}>단체 채팅</Text>
              </Pressable>
            </View>

            {/* direct form */}
            {tab === "direct" && (
              <View style={{ gap: 10 }}>
                <Text style={{ fontSize: 12, color: "#6b7280" }}>
                  상대 사용자 ID
                </Text>
                <TextInput
                  value={targetUserId}
                  onChangeText={setTargetUserId}
                  keyboardType={Platform.select({
                    web: "numeric",
                    default: "number-pad",
                  })}
                  placeholder="예) 2"
                  style={styles.input}
                />
                <Pressable onPress={submitDirect} style={styles.primaryBtn}>
                  <Text style={styles.primaryBtnText}>개인 채팅 만들기</Text>
                </Pressable>
              </View>
            )}

            {/* group form */}
            {tab === "group" && (
              <View style={{ gap: 10 }}>
                <Text style={{ fontSize: 12, color: "#6b7280" }}>
                  방 제목 (선택)
                </Text>
                <TextInput
                  value={groupTitle}
                  onChangeText={setGroupTitle}
                  placeholder="예) 프로젝트 단톡"
                  style={styles.input}
                />
                <Text style={{ fontSize: 12, color: "#6b7280" }}>
                  초대할 사용자 ID들 (쉼표로 구분)
                </Text>
                <TextInput
                  value={invitedIds}
                  onChangeText={setInvitedIds}
                  placeholder="예) 2,3,5"
                  style={styles.input}
                />
                <Pressable onPress={submitGroup} style={styles.primaryBtn}>
                  <Text style={styles.primaryBtnText}>단체 채팅 만들기</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <BottomTabs />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#111" },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBox: {
    height: 40,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  sheet: {
    width: "92%",
    marginBottom: 24,
    borderRadius: 14,
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  tab: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: { fontWeight: "700", color: "#111" },
  input: {
    height: 44,
    borderRadius: 10,
    backgroundColor: "#f5f6f7",
    paddingHorizontal: 12,
  },
  primaryBtn: {
    height: 44,
    borderRadius: 10,
    backgroundColor: "#7C74FF",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
});
