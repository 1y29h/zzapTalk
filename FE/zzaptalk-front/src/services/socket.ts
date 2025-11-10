// src/services/socket.ts

import { CompatClient, IMessage, Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { MessageType } from "../types/chat";
import type { ChatMessageResponse } from "../types/chat";

// (이 부분은 명세서와 일치하지 않지만, chat.ts에서 사용하므로 일단 둡니다)
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
  // 엔드포인트는 .env의 '.../ws'를 사용 (명세서와 일치)
  const sock = new SockJS(WS_BASE || "/ws-stomp");
  client = Stomp.over(sock) as CompatClient;

  // 콘솔 로그 억제
  (client as any).debug = () => {};

  client.connect({}, () => {
    // 🛑 [수정 1] 구독 경로를 명세서에 맞게 변경
    client?.subscribe(`/topic/chat.${roomId}`, (frame: IMessage) => {
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
  senderId: number, // [id].tsx는 'myId' (숫자)를 보냄
  content: string
) {
  if (!client || !(client as any).connected) return;

  // 🛑 [수정 2] 전송 데이터를 명세서에 맞게 수정
  const payload = {
    roomId: String(roomId), // 명세서: String
    sender: String(senderId), // 명세서: String (숫자 ID를 문자열로 변환)
    content: content, // 명세서: String
    // 'receiver'는 필수가 아니므로 생략
    // 'type'은 명세서에 없으므로 삭제
  };

  // 🛑 [수정 3] 전송 경로를 명세서에 맞게 수정
  (client as any).send(
    `/app/chat.sendMessage.${roomId}`, // roomId가 동적으로 포함됨
    {},
    JSON.stringify(payload)
  );
}

// (B) 페이로드 통째로 보내는 버전 (이 함수는 현재 사용되지 않음)
export function publishMessage(payload: ChatPayload) {
  // ... (만약 이 함수도 사용한다면 위와 같이 수정 필요) ...
}
