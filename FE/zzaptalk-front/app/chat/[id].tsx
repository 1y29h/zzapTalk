// app/chat/[id].tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Keyboard,
} from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { getChatMessages, getChatRoomList } from "../../src/services/chat";
import type { ChatMessageResponse } from "../../src/types/chat";

import { loadTokenWithExpiry } from "../../src/lib/authStorage";
import { parseJwt } from "../../src/lib/jwt";

// (선택) 소켓: 있으면 사용, 없으면 무시
let connectStomp: undefined | ((token: string) => Promise<void>);
let disconnectStomp: undefined | (() => void);
let sendChatMessageRaw:
  | undefined
  | ((roomId: number, content: string) => Promise<any>)
  | ((roomId: number, senderId: number, content: string) => Promise<any>);
let subscribeRoom:
  | undefined
  | ((roomId: number, cb: (m: ChatMessageResponse) => void) => () => void);

try {
  const mod = require("../../src/services/socket");
  connectStomp = mod.connectStomp;
  disconnectStomp = mod.disconnectStomp;
  sendChatMessageRaw = mod.sendChatMessage;
  subscribeRoom = mod.subscribeRoom;
} catch {}

/** JWT에서 내 userId 추출 */
async function getMyId(): Promise<number | null> {
  try {
    const saved = await loadTokenWithExpiry();
    if (!saved?.token) return null;
    const p = parseJwt(saved.token);
    const sub = p?.sub;
    return sub ? Number(sub) : null;
  } catch {
    return null;
  }
}

/** sendChatMessage 시그니처 호환 래퍼 */
async function sendCompat(roomId: number, myId: number, content: string) {
  if (!sendChatMessageRaw) return;
  if (sendChatMessageRaw.length === 2) {
    return (sendChatMessageRaw as (r: number, c: string) => Promise<any>)(
      roomId,
      content
    );
  }
  return (
    sendChatMessageRaw as (r: number, s: number, c: string) => Promise<any>
  )(roomId, myId, content);
}

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const roomId = Number(id);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [msgs, setMsgs] = useState<ChatMessageResponse[]>([]);
  const [text, setText] = useState("");
  const [myId, setMyId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const flatRef = useRef<FlatList<ChatMessageResponse>>(null);
  const unsubRef = useRef<null | (() => void)>(null);
  const lastRedirectRef = useRef<string>("");

  const redirectOnce = useCallback(
    (to: string) => {
      if (lastRedirectRef.current === to) return;
      lastRedirectRef.current = to;
      router.replace(to as Href);
    },
    [router]
  );

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      flatRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  // 내 ID, 토큰 로드 (초기 1회)
  useEffect(() => {
    (async () => {
      const saved = await loadTokenWithExpiry();
      setToken(saved?.token || null);
      setMyId(await getMyId());
    })();
  }, []);

  // 방 입장 & 초기 로딩
  const load = useCallback(async () => {
    try {
      const rooms = await getChatRoomList();
      if (!rooms.some((r) => r.roomId === roomId)) {
        Alert.alert("접근 불가", "이 채팅방의 멤버가 아니에요.");
        redirectOnce("/chat");
        return;
      }

      setLoading(true);
      const data = await getChatMessages(roomId);
      const sorted = [...data].sort((a, b) => {
        const ta = Date.parse((a as any).createdAt ?? (a as any).sentAt ?? 0);
        const tb = Date.parse((b as any).createdAt ?? (b as any).sentAt ?? 0);
        return ta - tb;
      });
      setMsgs(sorted);
      scrollToBottom();
    } catch (e: any) {
      const status = e?.response?.status ?? e?.status;
      if (status === 403) {
        Alert.alert("권한 오류 (403)", "이 방의 메시지를 볼 권한이 없어요.");
        redirectOnce("/chat");
        return;
      }
      if (status === 401) {
        redirectOnce("/login");
        return;
      }
      Alert.alert(
        "오류",
        e?.response?.data?.message ||
          e?.message ||
          "메시지를 불러오지 못했어요."
      );
    } finally {
      setLoading(false);
    }
  }, [roomId, redirectOnce, scrollToBottom]);

  // roomId 검증 & 1회 리다이렉트
  useEffect(() => {
    if (!Number.isFinite(roomId)) {
      redirectOnce("/chat");
    }
  }, [roomId, redirectOnce]);

  // roomId 변경 시에만 초기 로딩
  useEffect(() => {
    if (!Number.isFinite(roomId)) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // STOMP 연결/구독
  useEffect(() => {
    if (!token || !connectStomp) return;

    let cleanup = () => {};
    (async () => {
      try {
        await connectStomp!(token);
        if (subscribeRoom) {
          const unsub = subscribeRoom(roomId, (m) => {
            setMsgs((prev) => {
              if (prev.some((x) => String(x.messageId) === String(m.messageId)))
                return prev;
              const next = [...prev, m];
              next.sort(
                (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
              );
              return next;
            });
            scrollToBottom();
          });
          unsubRef.current = unsub;
          cleanup = () => unsub?.();
        }
      } catch {
        // 소켓 연결 실패 시 무시
      }
    })();

    return () => {
      cleanup?.();
      unsubRef.current = null;
      disconnectStomp?.();
    };
  }, [roomId, token, scrollToBottom]);

  // 메시지 전송
  const onSend = useCallback(async () => {
    const t = text.trim();
    if (!t || !myId) return;

    const nowIso = new Date().toISOString();
    const optimistic: ChatMessageResponse = {
      messageId: Date.now(),
      roomId,
      senderId: myId,
      content: t,
      createdAt: nowIso,
      sentAt: nowIso,
      senderName: "Me",
      type: "TEXT",
    };

    setMsgs((prev) => [...prev, optimistic]);
    setText("");
    scrollToBottom();

    try {
      if (sendChatMessageRaw) {
        await sendCompat(roomId, myId, t);
      }
      await load(); // 서버 타임스탬프 동기화(선택)
    } catch {
      Alert.alert("전송 실패", "메시지를 보낼 수 없어요.");
      setMsgs((prev) =>
        prev.filter((m) => m.messageId !== optimistic.messageId)
      );
    }
  }, [text, myId, roomId, scrollToBottom, load]);

  const renderItem = useCallback(
    ({ item }: { item: ChatMessageResponse }) => {
      const mine = myId != null && item.senderId === myId;
      return (
        <View style={[styles.row, mine ? styles.rowMine : styles.rowOther]}>
          <View
            style={[
              styles.bubble,
              mine ? styles.bubbleMine : styles.bubbleOther,
            ]}
          >
            {!mine && item.senderName ? (
              <Text style={styles.senderName}>{item.senderName}</Text>
            ) : null}
            <Text style={mine ? styles.msgTextMine : styles.msgTextOther}>
              {item.content}
            </Text>
            <Text style={styles.timeText}>
              {new Date(item.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>
      );
    },
    [myId]
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f9f9f9" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.select({ ios: 52, android: 0, web: 0 })}
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </Pressable>
        <Text style={styles.headerTitle}>채팅방 {roomId}</Text>
        <Pressable onPress={load} style={styles.headerBtn}>
          <Ionicons name="refresh" size={20} color="#111" />
        </Pressable>
      </View>

      {/* 메시지 리스트 */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          ref={flatRef}
          data={msgs}
          keyExtractor={(m) => String(m.messageId)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12, paddingBottom: 8 }}
          onContentSizeChange={scrollToBottom}
          onScrollBeginDrag={() => Platform.OS !== "web" && Keyboard.dismiss()}
        />
      )}

      {/* 입력바 */}
      <View style={styles.inputBar}>
        <TextInput
          placeholder="메시지 입력"
          value={text}
          onChangeText={setText}
          style={styles.input}
          onSubmitEditing={onSend}
          returnKeyType="send"
        />
        <Pressable
          style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
          onPress={onSend}
          disabled={!text.trim()}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 52,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e9ecef",
    backgroundColor: "#fff",
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "600", color: "#111" },

  loadingBox: { flex: 1, alignItems: "center", justifyContent: "center" },

  row: { flexDirection: "row", marginVertical: 4, paddingHorizontal: 8 },
  rowMine: { justifyContent: "flex-end" },
  rowOther: { justifyContent: "flex-start" },

  bubble: {
    maxWidth: "80%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMine: { backgroundColor: "#6b5cf6", borderBottomRightRadius: 4 },
  bubbleOther: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderBottomLeftRadius: 4,
  },

  senderName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  msgTextMine: { color: "#fff", fontSize: 15, lineHeight: 22 },
  msgTextOther: { color: "#111", fontSize: 15, lineHeight: 22 },

  timeText: { marginTop: 4, fontSize: 11, color: "#888", textAlign: "right" },

  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e9ecef",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f1f3f5",
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    backgroundColor: "#6b5cf6",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: "#ced4da" },
});
