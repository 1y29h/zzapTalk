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
  ChatPayload,
  connectStomp,
  disconnectStomp,
  sendChatMessage,
} from "../../src/services/socket";

import roomStyles from "../../src/styles/chat/ChatRoom.module";

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

export default function ChatRoom() {
  const {
    id: roomId,
    type,
    title,
  } = useLocalSearchParams<{
    id?: string;
    type?: string; // "group" | undefined
    title?: string; // 헤더에 보여줄 이름(그룹명/상대명)
  }>();
  const isGroup = type === "group";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [peerName, setPeerName] = useState<string | undefined>(
    isGroup ? (title as string) || "그룹 채팅" : (title as string) || undefined
  );
  const listRef = useRef<FlatList<Row>>(null);

  const myName = "minseo"; // TODO: 로그인 사용자명으로 교체

  // STOMP 연결
  useEffect(() => {
    if (!roomId) return;

    const client = connectStomp(roomId, (payload: ChatPayload) => {
      const mine = payload.sender === myName;

      // 그룹이면 상대 메시지에 발신자 이름을 표시
      const newMsg: ChatMessage = {
        id: `${Date.now()}`, // TODO: 서버 id 사용
        sender: mine ? "me" : "other",
        text: payload.content,
        createdAt: new Date(),
        otherName: !mine && isGroup ? payload.sender : undefined,
      };

      // 1:1에서 상대 이름이 아직 없으면 첫 수신 시 세팅
      if (!isGroup && !mine && !peerName) setPeerName(payload.sender);

      setMessages((prev) => [...prev, newMsg]);
      requestAnimationFrame(() =>
        listRef.current?.scrollToEnd({ animated: true })
      );
    });

    return () => {
      disconnectStomp();
    };
    // roomId / isGroup 만 의존 (peerName 넣으면 재연결 루프 위험)
  }, [roomId, isGroup]);

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
    if (!roomId) return;

    // 화면에 먼저 추가
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}`, sender: "me", text, createdAt: new Date() },
    ]);

    // 서버 발행
    const payload: ChatPayload = {
      roomId,
      sender: myName,
      receiver: isGroup ? roomId : peerName || "unknown",
      content: text,
    };
    sendChatMessage(payload);
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
                // 그룹이면 이름/아바타 표시 옵션 사용 (MessageBubble이 지원하는 경우)
                isGroup={isGroup}
                showName={isGroup}
                // showAvatar={isGroup}
              />
            )
          }
        />
        <MessageInput onSend={handleSend} />
      </KeyboardAvoidingView>
    </View>
  );
}
