import React from "react";
import { Text, View } from "react-native";
import styles from "../../styles/chat/MessageBubble.module";

export type ChatMessage = {
  id: string;
  sender: "me" | "other";
  text: string;
  createdAt: Date;
  otherName?: string;
};

const fmtTime = (d: Date) => {
  const m = `${d.getMinutes()}`.padStart(2, "0");
  const h24 = d.getHours();
  const ampm = h24 < 12 ? "오전" : "오후";
  const h = h24 % 12 || 12;
  return `${ampm} ${h}:${m}`;
};

export default function MessageBubble({
  message,
  showTime = true,
}: {
  message: ChatMessage;
  showTime?: boolean;
}) {
  const mine = message.sender === "me";

  return (
    <View style={[styles.wrap, mine ? styles.wrapMine : styles.wrapOther]}>
      {/* 상대방일 때 이름 */}
      {!mine && !!message.otherName && (
        <Text style={styles.name} numberOfLines={1}>
          {message.otherName}
        </Text>
      )}

      {/* 가로 배치: 내 메시지는 [시간, 버블], 상대는 [버블, 시간] */}
      <View style={[styles.row, mine ? styles.rowMine : styles.rowOther]}>
        {mine && showTime ? (
          <Text style={[styles.time, styles.timeMine]}>
            {fmtTime(message.createdAt)}
          </Text>
        ) : null}

        <View
          style={[styles.bubble, mine ? styles.myBubble : styles.otherBubble]}
        >
          <Text style={styles.text}>{message.text}</Text>
        </View>

        {!mine && showTime ? (
          <Text style={[styles.time, styles.timeOther]}>
            {fmtTime(message.createdAt)}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
