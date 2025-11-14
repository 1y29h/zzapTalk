// app/friends/index.tsx
import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Modal,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// 스타일 import (경로는 프로젝트 구조에 맞게)
import styles from "../../src/styles/friends/Friends.module";

type Friend = {
  id: number;
  name: string;
};

const MY_NAME = "김민서";

export default function FriendsScreen() {
  const [friends, setFriends] = useState<Friend[]>([
    { id: 1, name: "친구 1" },
    { id: 2, name: "친구 2" },
  ]);

  const [search, setSearch] = useState("");
  const [addTab, setAddTab] = useState<"phone" | "id">("phone");
  const [newFriendName, setNewFriendName] = useState("");

  // 🔽 바텀시트 visible 상태
  const [sheetVisible, setSheetVisible] = useState(false);

  // 🔽 애니메이션 값들
  const sheetTranslateY = useRef(new Animated.Value(40)).current;
  const sheetOpacity = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const filteredFriends = useMemo(
    () =>
      friends.filter((f) =>
        f.name.toLowerCase().includes(search.trim().toLowerCase())
      ),
    [friends, search]
  );

  // ===== 친구 추가 로직 =====
  const onConfirmAdd = () => {
    const name = newFriendName.trim();
    if (!name) return;

    setFriends((prev) => [...prev, { id: Date.now(), name }]);
    setNewFriendName("");
    closeSheet();
  };

  // ===== 바텀시트 열기/닫기 + 애니메이션 =====
  const openSheet = () => {
    setSheetVisible(true);
    sheetTranslateY.setValue(40);
    sheetOpacity.setValue(0);
    backdropOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(sheetTranslateY, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(sheetOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(sheetTranslateY, {
        toValue: 40,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(sheetOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setSheetVisible(false);
      }
    });
  };

  // ====== 렌더링 ======
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 상단바 */}
        <View style={styles.header}>
          <View style={styles.headerLeft} />
          <Text style={styles.headerTitle}>친구</Text>

          <View style={styles.headerRight}>
            <Ionicons
              name="search-outline"
              size={22}
              style={styles.headerIcon}
            />
            <Pressable onPress={openSheet}>
              <Ionicons
                name="person-add-outline"
                size={22}
                style={styles.headerIcon}
              />
            </Pressable>
            <Pressable onPress={() => {}}>
              <Ionicons
                name="settings-outline"
                size={22}
                style={styles.headerIcon}
              />
            </Pressable>
          </View>
        </View>

        {/* 내 프로필 */}
        <View style={styles.myProfileSection}>
          <View style={styles.myProfileAvatar}>
            <Ionicons name="person-outline" size={32} color="#777" />
          </View>
          <Text style={styles.myProfileName}>{MY_NAME}</Text>
        </View>

        {/* 검색창 */}
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={18} color="#999" />
          <TextInput
            placeholder="친구 이름 검색"
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>

        {/* 친구 수 */}
        <Text style={styles.friendCount}>친구 수 {friends.length}명</Text>

        {/* 친구 목록 */}
        <FlatList
          data={filteredFriends}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.friendRow}>
              <View style={styles.friendAvatar}>
                <Ionicons name="person-outline" size={24} color="#777" />
              </View>
              <Text style={styles.friendName}>{item.name}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>추가된 친구가 없습니다.</Text>
            </View>
          }
        />

        {/* ====== 애니메이션 BottomSheet ====== */}
        <Modal
          transparent
          visible={sheetVisible}
          animationType="none" // 직접 애니메이션 제어
          onRequestClose={closeSheet}
        >
          <Animated.View
            style={[styles.modalBackdrop, { opacity: backdropOpacity }]}
          >
            {/* 바깥 탭하면 닫기 */}
            <Pressable style={styles.modalBackdropTouch} onPress={closeSheet} />
            {/* 아래에서 올라오는 카드 */}
            <Animated.View
              style={[
                styles.modalCardBottom,
                {
                  transform: [{ translateY: sheetTranslateY }],
                  opacity: sheetOpacity,
                },
              ]}
            >
              <Text style={styles.modalTitle}>친구 추가</Text>

              {/* 탭 */}
              <View style={styles.modalTabs}>
                <Pressable
                  style={[
                    styles.modalTab,
                    addTab === "phone" && styles.modalTabActive,
                  ]}
                  onPress={() => setAddTab("phone")}
                >
                  <Text
                    style={[
                      styles.modalTabText,
                      addTab === "phone" && styles.modalTabTextActive,
                    ]}
                  >
                    연락처로 추가
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.modalTab,
                    addTab === "id" && styles.modalTabActive,
                  ]}
                  onPress={() => setAddTab("id")}
                >
                  <Text
                    style={[
                      styles.modalTabText,
                      addTab === "id" && styles.modalTabTextActive,
                    ]}
                  >
                    ID로 추가
                  </Text>
                </Pressable>
              </View>

              {/* 입력 */}
              <View style={styles.modalBody}>
                <TextInput
                  placeholder={
                    addTab === "phone" ? "연락처 이름/번호" : "친구 ID"
                  }
                  placeholderTextColor="#aaa"
                  value={newFriendName}
                  onChangeText={setNewFriendName}
                  style={styles.modalInput}
                />
              </View>

              {/* 버튼 */}
              <View style={styles.modalFooter}>
                <Pressable style={styles.modalCancelBtn} onPress={closeSheet}>
                  <Text style={styles.modalCancelText}>취소</Text>
                </Pressable>

                <Pressable
                  style={styles.modalConfirmBtn}
                  onPress={onConfirmAdd}
                >
                  <Text style={styles.modalConfirmText}>확인</Text>
                </Pressable>
              </View>
            </Animated.View>
          </Animated.View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
