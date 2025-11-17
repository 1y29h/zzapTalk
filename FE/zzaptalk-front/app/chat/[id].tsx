// app/chat/[id].tsx
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, View } from "react-native";

import ChatHeader from "../../src/components/chat/ChatHeader";
import DateDivider from "../../src/components/chat/DateDivider";
import MessageBubble, {
  ChatMessage,
} from "../../src/components/chat/MessageBubble";
import MessageInput from "../../src/components/chat/MessageInput";

import {
  connectStomp,
  disconnectStomp,
  sendChatMessage,
} from "../../src/services/socket";
import { getChatMessages } from "../../src/services/chat";
import type { ChatMessageResponse } from "../../src/types/chat";

import roomStyles from "../../src/styles/chat/ChatRoom.module";

// (토큰에서 내 userId 뽑기 - 프로젝트에 이미 있는 유틸 사용)
import { loadTokenWithExpiry } from "../../src/lib/authStorage";
import { parseJwt } from "../../src/lib/jwt";

// 날짜 비교/포맷
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function formatDateK(d: Date) {
  const ws = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${ws})`;
}

// 행 타입
type Row =
  | { type: "date"; id: string; label: string }
  | { type: "msg"; id: string; msg: ChatMessage; showTime: boolean };

// 토큰에서 내 userId 구하는 헬퍼
async function getMyId(): Promise<number | null> {
  const saved = await loadTokenWithExpiry();
  if (!saved?.token) return null;
  try {
    const p = parseJwt(saved.token);
    const sub = p?.sub;
    return sub ? Number(sub) : null; // 서버가 subject=User.id
  } catch {
    return null;
  }
}

export default function ChatRoom() {
  const { id, type, title } = useLocalSearchParams<{
    id?: string;
    type?: string; // "group" | undefined
    title?: string; // 헤더에 보여줄 이름(그룹명/상대명)
  }>();

  // roomId는 숫자로 보장
  const roomId = useMemo(() => Number(id), [id]);
  const isGroup = type === "group";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [peerName, setPeerName] = useState<string | undefined>(
    isGroup ? (title as string) || "그룹 채팅" : (title as string) || undefined
  );
  const [myId, setMyId] = useState<number | null>(null);

  const listRef = useRef<FlatList<Row>>(null);

  // 내 userId 복원
  useEffect(() => {
    (async () => {
      const uid = await getMyId();
      setMyId(uid);
    })();
  }, []);

  // 과거 메시지 로딩
  useEffect(() => {
    if (!roomId) return;
    (async () => {
      const history: ChatMessageResponse[] = await getChatMessages(roomId);
      const mapped: ChatMessage[] = history.map((m) => {
        const mine = myId != null && m.senderId === myId;
        return {
          id: String(m.messageId ?? `${m.roomId}-${m.sentAt}`),
          sender: mine ? "me" : "other",
          text: m.content,
          createdAt: new Date(m.sentAt),
          otherName: !mine && isGroup ? m.senderName : undefined,
        };
      });
      setMessages(mapped);
      requestAnimationFrame(() =>
        listRef.current?.scrollToEnd({ animated: false })
      );
    })();
    // myId가 바뀌면 mine 판별도 달라지므로 의존성에 포함
  }, [roomId, myId, isGroup]);

  // STOMP 연결 (실시간 수신)
  useEffect(() => {
    if (!roomId) return;

    connectStomp(roomId, (payload: ChatMessageResponse) => {
      const mine = myId != null && payload.senderId === myId;

      const newMsg: ChatMessage = {
        id: String(payload.messageId ?? `${payload.roomId}-${payload.sentAt}`),
        sender: mine ? "me" : "other",
        text: payload.content,
        createdAt: new Date(payload.sentAt),
        otherName: !mine && isGroup ? payload.senderName : undefined,
      };

      // 1:1에서 상대 이름이 아직 없으면 첫 수신 시 세팅
      if (!isGroup && !mine && !peerName) setPeerName(payload.senderName);

      setMessages((prev) => [...prev, newMsg]);
      requestAnimationFrame(() =>
        listRef.current?.scrollToEnd({ animated: true })
      );
    });

    return () => {
      disconnectStomp();
    };
    // peerName 포함하면 재연결 루프 가능성 있으므로 제외
  }, [roomId, myId, isGroup]);

  // 날짜 구분/분 단위 시간 표시
  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    let lastDate: Date | null = null;
    let lastMinute: number | null = null;

    for (const m of messages) {
      if (!lastDate || !isSameDay(lastDate, m.createdAt)) {
        out.push({
          type: "date",
          id: `d-${m.id}`,
          label: formatDateK(m.createdAt),
        });
        lastDate = m.createdAt;
        lastMinute = null;
      }
      const minute = m.createdAt.getHours() * 60 + m.createdAt.getMinutes();
      const showTime = lastMinute === null || lastMinute !== minute;
      out.push({ type: "msg", id: m.id, msg: m, showTime });
      lastMinute = minute;
    }
    return out;
  }, [messages]);

  // 전송
  const handleSend = (text: string) => {
    if (!roomId || !myId) return;

    // 화면에 먼저 추가 (낙관적 업데이트)
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}`, sender: "me", text, createdAt: new Date() },
    ]);

    // 서버 발행 (roomId, myId, content) 3개 인자
    sendChatMessage(roomId, myId, text);
  };

  const headerTitle = isGroup ? peerName ?? "그룹 채팅" : peerName ?? "대화";

  return (
    <View style={roomStyles.container}>
      <ChatHeader name={headerTitle} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <FlatList
          ref={listRef}
          data={rows}
          keyExtractor={(item) => item.id}
          contentContainerStyle={roomStyles.listContent}
          renderItem={({ item }) =>
            item.type === "date" ? (
              <DateDivider label={item.label} />
            ) : (
              <MessageBubble
                message={item.msg}
                showTime={item.showTime}
                isGroup={isGroup}
                showName={isGroup}
              />
            )
          }
        />
        <MessageInput onSend={handleSend} />
      </KeyboardAvoidingView>
    </View>
  );
}
