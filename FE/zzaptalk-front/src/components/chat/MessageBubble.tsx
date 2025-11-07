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
      {/* 상대방일 때 이름 한 줄 */}
      {!mine && !!message.otherName && (
        <Text style={styles.name} numberOfLines={1}>
          {message.otherName}
        </Text>
      )}

      {/* 버블 + 옆시간 (가로배치) */}
      <View style={[styles.row, mine ? styles.rowMine : styles.rowOther]}>
        {/* 상대는 [버블, 시간] / 나는 [시간, 버블]이 아니라
            카톡 스타일로 '내 버블 오른쪽에 시간'이므로
            mine일 때 버블 먼저, 시간 오른쪽에 배치 */}
        <View
          style={[styles.bubble, mine ? styles.myBubble : styles.otherBubble]}
        >
          <Text style={styles.text}>{message.text}</Text>
        </View>

        {showTime && (
          <Text
            style={[styles.time, mine ? styles.timeMine : styles.timeOther]}
          >
            {fmtTime(message.createdAt)}
          </Text>
        )}
      </View>
    </View>
  );
}
