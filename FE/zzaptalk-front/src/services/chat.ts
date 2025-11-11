// 🛑 [수정 1] 'api' 대신 헬퍼 함수 'get', 'post'를 임포트
import { get, post } from "../lib/api";
import type {
  ChatRoomUserListItem,
  ChatRoomResponse,
  ChatMessageResponse,
} from "../types/chat";

// 🛑 [수정 2] 새 명세서에 맞는 응답 타입 정의
export type GroupChatRoomResponse = {
  roomId: number;
  roomName: string; // (서버가 null을 반환하지 않는다고 가정, 명세서엔 string)
  memberNicknames: string[];
};

/**
 * 채팅방 목록 조회
 */
export async function getChatRoomList(): Promise<ChatRoomUserListItem[]> {
  // 🛑 [수정 3] 'api.get' -> 'get' 헬퍼 사용
  const data = await get<ChatRoomUserListItem[]>("/api/chat/rooms/list");
  return data;
}

/**
 * 1:1 채팅방 생성 또는 조회
 */
export async function createOrGetSingleChatRoom(
  targetUserId: number
): Promise<ChatRoomResponse> {
  // 🛑 [수정 4] 'api.post' -> 'post' 헬퍼 사용
  const data = await post<ChatRoomResponse>("/api/chat/rooms/single", {
    targetUserId,
  });
  return data;
}

/**
 * 그룹 채팅방 생성 (새 명세서 적용)
 */
export async function createGroupChatRoom(
  roomName: string | null, // 👈 Spec: null 허용
  invitedUserIds: number[]
): Promise<GroupChatRoomResponse> {
  // 👈 Spec: 새 응답 타입
  // 🛑 [수정 5] 'api.post' -> 'post' 헬퍼 사용 및 새 타입 적용
  const data = await post<GroupChatRoomResponse>("/api/chat/rooms/group", {
    roomName,
    invitedUserIds,
  });
  return data;
}

/**
 * 채팅 메시지 내역 조회
 */
export async function getChatMessages(
  roomId: number
): Promise<ChatMessageResponse[]> {
  // 🛑 [수정 6] 'api.get' -> 'get' 헬퍼 사용
  const data = await get<ChatMessageResponse[]>(
    `/api/chat/rooms/${roomId}/messages`
  );
  return data;
}
