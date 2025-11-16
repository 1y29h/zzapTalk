// app/(tabs)/chat/index.tsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, type Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { getChatRoomList } from "../../../src/services/chat";
import type { ChatRoomUserListItem } from "../../../src/types/chat";
import styles from "../../../src/styles/chat/ChatList.module";

export default function ChatListScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<ChatRoomUserListItem[]>([]);
  const autoOpenedRef = useRef(false);

  // 🔽 바텀시트 상태
  const [showCreate, setShowCreate] = useState(false);
  const [createTab, setCreateTab] = useState<"single" | "group">("single");
  const [partnerId, setPartnerId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getChatRoomList();
      setRooms(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ✅ 방으로 이동할 때 roomName을 title 파라미터로 같이 보냄
  const goRoom = useCallback(
    (roomId: number, roomName?: string) => {
      router.push({
        pathname: `/chat/${roomId}`,
        params: roomName ? { title: roomName } : {},
      } as Href);
    },
    [router]
  );

  // ✅ 개인 채팅 만들기 버튼 (여기에 나중에 API 연결하면 됨)
  const onCreateSingle = useCallback(() => {
    if (!partnerId.trim()) {
      Alert.alert("알림", "상대 사용자 ID를 입력해 주세요.");
      return;
    }

    // TODO: 여기서 /api/chat/rooms/single 호출하는 함수 연결
    Alert.alert("개인 채팅", `상대 ID: ${partnerId}로 개인 채팅 생성 요청!`);

    // 성공 후에는 시트 닫고 목록 새로고침 같은 거 하면 됨
    setShowCreate(false);
    setPartnerId("");
  }, [partnerId]);

  return (
    <View style={styles.safeArea}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <Text style={styles.headerTitle}>채팅</Text>

        <View style={styles.headerRight}>
          {/* 검색 아이콘 */}
          <Pressable style={styles.headerIconBtn} onPress={() => {}}>
            <Ionicons name="search" size={20} style={styles.headerIcon} />
          </Pressable>

          {/* 플러스(새 채팅 만들기) 아이콘 */}
          <Pressable
            style={styles.headerPlusBtn}
            onPress={() => setShowCreate(true)} // 🔥 페이지 이동 X, 시트 열기
          >
            <Ionicons name="add" size={18} style={styles.headerPlusIcon} />
          </Pressable>
        </View>
      </View>

      {/* 채팅방 리스트 */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => String(item.roomId)}
          contentContainerStyle={styles.roomList}
          renderItem={({ item }) => (
            <Pressable
              style={styles.roomRow}
              onPress={() => goRoom(item.roomId, item.roomName)}
            >
              <View style={styles.roomAvatar}>
                <Text style={styles.roomAvatarInitial}>
                  {item.roomName?.charAt(0) ?? "채"}
                </Text>
              </View>
              <Text style={styles.roomName}>{item.roomName}</Text>
            </Pressable>
          )}
        />
      )}

      {/* 🔽 채팅방 생성 바텀시트 */}
      <Modal
        visible={showCreate}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreate(false)}
      >
        <KeyboardAvoidingView
          style={styles.sheetBackdrop}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* 배경 회색 영역 눌러서 닫기 */}
          <Pressable
            style={styles.sheetBackdropTouchable}
            onPress={() => setShowCreate(false)}
          />

          {/* 실제 카드 부분 */}
          <View style={styles.sheetContainer}>
            {/* 탭 버튼 */}
            <View style={styles.sheetTabRow}>
              <Pressable
                style={[
                  styles.sheetTab,
                  createTab === "single" && styles.sheetTabActive,
                ]}
                onPress={() => setCreateTab("single")}
              >
                <Text
                  style={[
                    styles.sheetTabText,
                    createTab === "single" && styles.sheetTabTextActive,
                  ]}
                >
                  개인 채팅
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.sheetTab,
                  createTab === "group" && styles.sheetTabActive,
                ]}
                onPress={() => setCreateTab("group")}
              >
                <Text
                  style={[
                    styles.sheetTabText,
                    createTab === "group" && styles.sheetTabTextActive,
                  ]}
                >
                  단체 채팅
                </Text>
              </Pressable>
            </View>

            {/* 개인 채팅 폼 (현재는 개인 채팅 기준 UI만 구현) */}
            {createTab === "single" && (
              <View style={styles.sheetBody}>
                <Text style={styles.sheetLabel}>상대 사용자 ID</Text>
                <View style={styles.sheetInputWrap}>
                  <TextInput
                    style={styles.sheetInput}
                    placeholder="예) 2"
                    value={partnerId}
                    onChangeText={setPartnerId}
                    keyboardType="numeric"
                  />
                </View>

                <Pressable
                  style={styles.sheetPrimaryBtn}
                  onPress={onCreateSingle}
                >
                  <Text style={styles.sheetPrimaryBtnText}>
                    개인 채팅 만들기
                  </Text>
                </Pressable>
              </View>
            )}

            {/* 단체 채팅은 일단 버튼만 (나중에 폼 추가) */}
            {createTab === "group" && (
              <View style={styles.sheetBody}>
                <Text style={styles.sheetLabel}>.</Text>
                <Pressable
                  style={styles.sheetPrimaryBtn}
                  onPress={() =>
                    Alert.alert(
                      "단체 채팅",
                      "단체 채팅 생성 로직을 연결하세요."
                    )
                  }
                >
                  <Text style={styles.sheetPrimaryBtnText}>
                    단체 채팅 만들기
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
