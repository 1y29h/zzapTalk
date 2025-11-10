/*
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useRef } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  View,
} from "react-native";

import ChatHeader from "../../../src/components/chat/ChatHeader";
import DateDivider from "../../../src/components/chat/DateDivider";
import MessageBubble, {
  ChatMessage,
} from "../../../src/components/chat/MessageBubble";
import MessageInput from "../../../src/components/chat/MessageInput";
import styles from "../../../src/styles/chat/ChatRoom.module";

export default function GroupChatScreen() {
  const router = useRouter();
  const { title } = useLocalSearchParams<{ title?: string }>();
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const messages = useMemo<ChatMessage[]>(() => [], []);

  const shouldShowTime = (curr: ChatMessage, prev?: ChatMessage) => {
    if (!prev) return true;
    const a = prev.createdAt;
    const b = curr.createdAt;
    return Math.floor(+a / 60000) !== Math.floor(+b / 60000);
  };

  const onSend = (t: string) => {
    // TODO: socket/HTTP 연결
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: ChatMessage;
    index: number;
  }) => {
    const prev = messages[index - 1];
    const showDate =
      !prev || prev.createdAt.toDateString() !== item.createdAt.toDateString();

    return (
      <>
        {showDate && <DateDivider label="채팅 대화 날짜" />}
        <MessageBubble
          message={item}
          isGroup
          showName
          showAvatar
          showTime={shouldShowTime(item, prev)}
        />
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
     
      <ChatHeader name={(title as string) ?? ""} />

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() =>
          listRef.current?.scrollToEnd({ animated: false })
        }
        onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 6 : 0}
      >
        <View style={styles.inputBar}>
          <MessageInput onSend={onSend} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
*/
