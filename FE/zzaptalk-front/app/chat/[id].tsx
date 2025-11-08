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

type Row =
  | { type: "date"; id: string; label: string }
  | { type: "msg"; id: string; msg: ChatMessage; showTime: boolean };

export default function ChatRoom() {
  const { id: roomId } = useLocalSearchParams<{ id?: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [peerName, setPeerName] = useState<string | undefined>(undefined); // ✅ 상대 이름 상태
  const listRef = useRef<FlatList<Row>>(null);
  const myName = "minseo"; // 로그인 후 교체

  // 1️⃣ STOMP 연결 및 구독
  useEffect(() => {
    if (!roomId) return;

    const client = connectStomp(roomId, (payload: ChatPayload) => {
      const isMine = payload.sender === myName;

      // 상대방이 보낸 첫 메시지면 이름 저장
      if (!isMine && !peerName) {
        setPeerName(payload.sender);
      }

      const newMsg: ChatMessage = {
        id: `${Date.now()}`,
        sender: isMine ? "me" : "other",
        text: payload.content,
        createdAt: new Date(),
        otherName: isMine ? undefined : payload.sender,
      };

      setMessages((prev) => [...prev, newMsg]);
      requestAnimationFrame(() =>
        listRef.current?.scrollToEnd({ animated: true })
      );
    });

    return () => {
      disconnectStomp();
    };
  }, [roomId, peerName]);

  // 2️⃣ 날짜별 묶음
  const rows = useMemo(() => {
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

  // 3️⃣ 메시지 전송
  const handleSend = (text: string) => {
    if (!roomId) return;
    const payload: ChatPayload = {
      roomId,
      sender: myName,
      receiver: peerName || "unknown", // 아직 상대가 없으면 unknown
      content: text,
    };

    // 1) 내 화면에 즉시 표시
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}`, sender: "me", text, createdAt: new Date() },
    ]);

    // 2) 서버로 발행
    sendChatMessage(payload);
  };

  return (
    <View style={roomStyles.container}>
      {/* ✅ 처음엔 이름이 없고, 상대가 메시지 보내면 표시됨 */}
      <ChatHeader name={peerName} />

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
              <MessageBubble message={item.msg} showTime={item.showTime} />
            )
          }
        />
        <MessageInput onSend={handleSend} />
      </KeyboardAvoidingView>
    </View>
  );
}
