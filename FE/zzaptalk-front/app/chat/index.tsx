// ChatListScreen.tsx

import { useEffect, useState, useCallback } from "react";
import {
  FlatList,
  Pressable,
  Text,
  View,
  RefreshControl,
  ActivityIndicator, // 로딩 스피너
  Image, // 이미지 (아바타용)
} from "react-native";
import { useRouter } from "expo-router";
import { getChatRoomList } from "../../src/services/chat";
import type { ChatRoomUserListItem } from "../../src/types/chat";

// 1. 스타일 모듈을 import 합니다.
import listStyles from "../../src/styles/chat/ChatList.module";

// --- 가짜 데이터 (이전과 동일) ---
const FAKE_ROOMS: ChatRoomUserListItem[] = [
  {
    roomId: 1,
    type: "GROUP",
    roomName: "🚀 K-Project 팀",
    unreadCount: 2,
    lastMessageTime: new Date(Date.now() - 300000).toISOString(),
    lastMessageContent: "백엔드 500 에러 해결됐나요?",
  },
  {
    roomId: 2,
    type: "SINGLE",
    roomName: "김민서",
    unreadCount: 0,
    lastMessageTime: new Date(Date.now() - 86400000).toISOString(),
    lastMessageContent: "네, 아까 그 코드 수정했어요!",
  },
  {
    roomId: 3,
    type: "SINGLE",
    roomName: "백엔드 개발자",
    unreadCount: 1,
    lastMessageTime: new Date(Date.now() - 172800000).toISOString(),
    lastMessageContent: "서버 재배포 완료했습니다.",
  },
];
// --- 가짜 데이터 끝 ---

export default function ChatListScreen() {
  const router = useRouter();
  const [rooms, setRooms] = useState<ChatRoomUserListItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // 2. 로딩 및 에러 상태 추가
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 3. load 함수를 useCallback으로 감싸고 로직 보강
  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true); // 새로고침이 아닐 때만 전체 로딩
    setError(null);

    try {
      // (1) 테스트용 가짜 데이터 (API 테스트 시 주석 처리)
      await new Promise((res) => setTimeout(res, 500)); // 0.5초 딜레이
      const data = FAKE_ROOMS;

      // (2) 실제 API 호출 (테스트 시 주석 처리)
      // const data = await getChatRoomList();

      data.sort((a, b) => {
        const ta = a.lastMessageTime ? Date.parse(a.lastMessageTime) : 0;
        const tb = b.lastMessageTime ? Date.parse(b.lastMessageTime) : 0;
        return tb - ta;
      });
      setRooms(data);
    } catch (e) {
      setError(e as Error);
    } finally {
      if (!isRefresh) setLoading(false);
      setRefreshing(false); // 당겨서 새로고침 종료
    }
  }, []); // 의존성 배열 비움

  useEffect(() => {
    load(false); // 컴포넌트 마운트 시 첫 로드
  }, [load]);

  // 4. onRefresh 로직 수정
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load(true); // 새로고침으로 로드
  }, [load]);

  const openRoom = (item: ChatRoomUserListItem) => {
    router.push({
      pathname: "/chat/[id]",
      params: {
        id: item.roomId,
        title: item.roomName,
        type: item.type === "GROUP" ? "group" : undefined,
      },
    });
  };

  // 5. Item 컴포넌트를 스타일 모듈을 사용하도록 수정
  const Item = ({ item }: { item: ChatRoomUserListItem }) => (
    <Pressable onPress={() => openRoom(item)} style={listStyles.row}>
      {/* 아바타 (방 이름 첫 글자) */}
      <View style={listStyles.avatar}>
        <Text style={listStyles.avatarLetter}>{item.roomName[0] || "?"}</Text>
      </View>

      {/* 채팅방 이름, 마지막 메시지 */}
      <View style={listStyles.rowTextWrap}>
        <Text style={listStyles.rowTitle} numberOfLines={1}>
          {item.roomName}
        </Text>
        {!!item.lastMessageContent && (
          <Text style={listStyles.rowSub} numberOfLines={1}>
            {item.lastMessageContent}
          </Text>
        )}
      </View>

      {/* 안 읽은 메시지 뱃지 */}
      {item.unreadCount > 0 && (
        <View style={listStyles.badge}>
          <Text style={listStyles.badgeText}>{item.unreadCount}</Text>
        </View>
      )}
    </Pressable>
  );

  // 6. 로딩 및 에러 상태에 따른 UI 분기
  if (loading) {
    return (
      <View style={listStyles.centerBox}>
        <ActivityIndicator size="large" color="#4b5563" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={listStyles.centerBox}>
        <Text style={listStyles.errorText}>
          채팅 목록을 불러오는 중 오류가 발생했습니다.
        </Text>
        <Pressable style={listStyles.retryBtn} onPress={() => load(false)}>
          <Text style={listStyles.retryText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  // 7. FlatList에 스타일 적용
  return (
    <FlatList
      style={listStyles.container}
      data={rooms}
      keyExtractor={(x) => String(x.roomId)}
      renderItem={Item}
      ItemSeparatorComponent={() => <View style={listStyles.sep} />}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <View style={listStyles.centerBox}>
          <Text style={listStyles.emptyText}>아직 채팅방이 없습니다.</Text>
        </View>
      }
    />
  );
}
