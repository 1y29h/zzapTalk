// src/services/socket.ts
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const BASE = process.env.EXPO_PUBLIC_API_BASE || "https://zzaptalk.com";
const WS_URL = `${BASE.replace(/\/+$/, "")}/ws`; // ✅ 백엔드 STOMP 엔드포인트

let client: Client | null = null;

export type ChatPayload = {
  roomId: string;
  sender: string;
  receiver: string;
  content: string;
};

export function connectStomp(
  roomId: string,
  onMessage: (msg: ChatPayload) => void
) {
  if (client?.connected) return client;

  client = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    reconnectDelay: 5000,
    debug: (str) => console.log("[STOMP]", str),
  });

  client.onConnect = () => {
    console.log("✅ STOMP 연결 성공");
    // 구독
    client?.subscribe(`/topic/chat.${roomId}`, (message: IMessage) => {
      const payload = JSON.parse(message.body) as ChatPayload;
      onMessage(payload);
    });
  };

  client.onStompError = (frame) => {
    console.error("❌ STOMP 오류", frame);
  };

  client.activate();
  return client;
}

export function disconnectStomp() {
  if (client && client.connected) {
    client.deactivate();
    console.log("🛑 STOMP 연결 종료");
  }
}

export function sendChatMessage(data: ChatPayload) {
  if (!client || !client.connected) {
    console.warn("⚠️ STOMP 연결이 없습니다. 메시지 전송 불가");
    return;
  }
  // 메시지 발행 경로 (백엔드 명세에 따라)
  client.publish({
    destination: `/app/chat.sendMessage.${data.roomId}`,
    body: JSON.stringify(data),
  });
}
