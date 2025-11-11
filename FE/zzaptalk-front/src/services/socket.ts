// src/services/socket.ts
import { Client, IMessage, StompHeaders } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { ChatMessageResponse, MessageType } from "../types/chat";

// .env 예) EXPO_PUBLIC_WS_BASE=https://api.zzaptalk.com/ws-stomp  (뒤에 / 없음)
const WS_BASE = (
  process.env.EXPO_PUBLIC_WS_BASE || "https://api.zzaptalk.com/ws"
).replace(/\/+$/, "");

// 내부 상태
let client: Client | null = null;
let unsub: (() => void) | null = null;
let connected = false;

// 날짜를 ISO 문자열로 안전 변환
function toIso(v?: any): string {
  if (!v) return new Date().toISOString();
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "number") {
    // epoch seconds 가능성까지 허용
    const ms = v < 1e12 ? v * 1000 : v;
    return new Date(ms).toISOString();
  }
  const n = Number(v);
  if (!Number.isNaN(n) && String(n) === String(v)) {
    const ms = n < 1e12 ? n * 1000 : n;
    return new Date(ms).toISOString();
  }
  return new Date(v).toISOString();
}

// 수신 payload → ChatMessageResponse 정규화
function normalize(body: any): ChatMessageResponse {
  const msgId =
    typeof body?.messageId === "number" || typeof body?.messageId === "string"
      ? body.messageId
      : typeof body?.id === "number" || typeof body?.id === "string"
      ? body.id
      : Date.now();

  const sent = body?.sentAt ?? body?.createdAt ?? body?.time ?? body?.timestamp;
  const created =
    body?.createdAt ?? body?.sentAt ?? body?.time ?? body?.timestamp;

  // 서버에서 type을 안 보내는 경우 기본 TEXT
  const typ: MessageType =
    (body?.type as MessageType) &&
    ["TEXT", "IMAGE", "ENTER", "LEAVE"].includes(body.type)
      ? (body.type as MessageType)
      : "TEXT";

  return {
    messageId: msgId,
    roomId: Number(body?.roomId ?? body?.room_id),
    senderId: Number(body?.senderId ?? body?.sender_id ?? body?.sender),
    senderName: String(
      body?.senderName ?? body?.senderNickname ?? body?.sender_name ?? ""
    ),
    content: String(body?.content ?? body?.message ?? ""),
    type: typ,
    sentAt: toIso(sent),
    createdAt: toIso(created),
  };
}

// ✅ 연결 + 해당 room 구독
export function connectStomp(
  roomId: number,
  onMessage: (msg: ChatMessageResponse) => void,
  token?: string
) {
  if (client?.active) return; // 이미 연결 시 무시

  client = new Client({
    webSocketFactory: () => new SockJS(WS_BASE || "/ws-stomp"),
    connectHeaders: token
      ? ({ Authorization: `Bearer ${token}` } as StompHeaders)
      : undefined,
    // debug: (m) => console.log("[STOMP]", m),
    onConnect: () => {
      connected = true;
      // 방 구독
      const sub = client!.subscribe(
        `/topic/chat.${roomId}`,
        (frame: IMessage) => {
          try {
            const body = JSON.parse(frame.body);
            onMessage(normalize(body));
          } catch (e) {
            console.warn("STOMP parse error:", e);
          }
        }
      );
      unsub = () => sub.unsubscribe();
    },
    onWebSocketClose: () => {
      connected = false;
      unsub = null;
      // console.warn("🔌 socket closed");
    },
    onStompError: (f) => {
      connected = false;
      unsub = null;
      console.error("❌ STOMP error:", f.headers["message"]);
    },
  });

  client.activate();
}

// ✅ 해제
export function disconnectStomp() {
  try {
    unsub?.();
    client?.deactivate();
  } finally {
    unsub = null;
    client = null;
    connected = false;
  }
}

export function isConnected() {
  return !!client?.connected && connected;
}

// ✅ 전송 (백엔드 명세: /chat.sendMessage.{roomId})
export async function sendChatMessage(
  roomId: number,
  senderId: number,
  content: string,
  type: MessageType = "TEXT",
  senderName?: string
) {
  if (!client || !client.connected) throw new Error("STOMP not connected");

  // 서버 구현차를 고려해 content와 message 모두 포함
  const now = new Date().toISOString();
  const payload = {
    roomId: String(roomId),
    senderId: String(senderId),
    content,
    message: content,
    type, // "TEXT" | "IMAGE" | "ENTER" | "LEAVE"
    sentAt: now, // 일부 서버는 클라 타임을 참고만 함 (서버에서 덮어쓸 수 있음)
    senderName, // 서버가 쓰면 전달, 아니면 무시
  };

  client.publish({
    destination: `/chat.sendMessage.${roomId}`,
    body: JSON.stringify(payload),
  });
}
