import { api } from "../lib/api";
import type {
  ChatRoomUserListItem,
  ChatRoomResponse,
  ChatMessageResponse,
} from "../types/chat";

export async function getChatRoomList(): Promise<ChatRoomUserListItem[]> {
  const res = await api.get("/api/chat/rooms/list");
  return res.data;
}

export async function createOrGetSingleChatRoom(
  targetUserId: number
): Promise<ChatRoomResponse> {
  const res = await api.post("/api/chat/rooms/single", { targetUserId });
  return res.data;
}

export async function createGroupChatRoom(
  roomName: string,
  invitedUserIds: number[]
): Promise<ChatRoomResponse> {
  const res = await api.post("/api/chat/rooms/group", {
    roomName,
    invitedUserIds,
  });
  return res.data;
}

export async function getChatMessages(
  roomId: number
): Promise<ChatMessageResponse[]> {
  const res = await api.get(`/api/chat/rooms/${roomId}/messages`);
  return res.data;
}
