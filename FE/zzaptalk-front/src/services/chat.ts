// src/services/chat.ts
import { api } from "../lib/api";

export type Room = {
  id: string;
  title: string;
  lastMessage?: string;
  unreadCount?: number;
  // 백엔드 필드와 매핑 필요시 여기에서 가공
};

type RoomResp = {
  id: string;
  title: string;
  lastMessage?: string;
  unreadCount?: number;
};

function toRoom(r: RoomResp): Room {
  return {
    id: String(r.id),
    title: r.title ?? "이름 없음",
    lastMessage: r.lastMessage ?? "",
    unreadCount: r.unreadCount ?? 0,
  };
}

export async function fetchGroupRooms(): Promise<Room[]> {
  const { data } = await api.get<RoomResp[]>("/api/chat/rooms/group");
  return (data ?? []).map(toRoom);
}

export async function fetchSingleRooms(): Promise<Room[]> {
  const { data } = await api.get<RoomResp[]>("/api/chat/rooms/single");
  return (data ?? []).map(toRoom);
}
