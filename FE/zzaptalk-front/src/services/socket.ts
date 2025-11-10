// src/services/socket.ts
import { CompatClient, IMessage, Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { MessageType } from "../types/chat";
import type { ChatMessageResponse } from "../types/chat";

// --- export: ChatPayload (id.tsx에서 import 하던 타입을 여기서도 제공)
export type ChatPayload = {
  roomId: number;
  senderId: number;
  content: string;
  type: MessageType; // "TEXT" | "IMAGE" | "ENTER" | "LEAVE"
};

let client: CompatClient | null = null;

const WS_BASE = (process.env.EXPO_PUBLIC_WS_BASE || "").replace(/\/+$/, "");

// STOMP 연결
export function connectStomp(
  roomId: number,
  onMessage: (msg: ChatMessageResponse) => void,
  onConnect?: () => void
) {
  const sock = new SockJS(WS_BASE || "/ws-stomp");
  client = Stomp.over(sock) as CompatClient;

  // 콘솔 로그 억제
  (client as any).debug = () => {};

  client.connect({}, () => {
    client?.subscribe(`/topic/chat/room/${roomId}`, (frame: IMessage) => {
      try {
        const body = JSON.parse(frame.body);
        onMessage(body);
      } catch (e) {
        console.warn("STOMP parse error", e);
      }
    });
    onConnect?.();
  });
}

export function disconnectStomp() {
  client?.deactivate();
  client = null;
}

export function isConnected(): boolean {
  return !!client && !!(client as any).connected;
}

// (A) 헬퍼: 세 인자 버전
export function sendChatMessage(
  roomId: number,
  senderId: number,
  content: string
) {
  if (!client || !(client as any).connected) return;
  const payload: ChatPayload = { roomId, senderId, content, type: "TEXT" };
  (client as any).send("/app/chat/message", {}, JSON.stringify(payload));
}

// (B) 페이로드 통째로 보내는 버전 (선호 시 사용)
export function publishMessage(payload: ChatPayload) {
  if (!client || !(client as any).connected) return;
  (client as any).send("/app/chat/message", {}, JSON.stringify(payload));
}
