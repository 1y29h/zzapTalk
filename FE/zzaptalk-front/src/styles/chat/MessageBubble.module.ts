import { StyleSheet, Platform } from "react-native";

const PURPLE = "#C9C8FF";
const GRAY = "#EFEFEF";
const TIME = "#969696";

export default StyleSheet.create({
  wrap: { marginBottom: 8 },
  wrapMine: { alignItems: "flex-end" },
  wrapOther: { alignItems: "flex-start" },

  name: { fontSize: 11, color: "#777", marginBottom: 2 },

  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    maxWidth: "100%",
  },
  rowMine: { justifyContent: "flex-end" },
  rowOther: { justifyContent: "flex-start" },

  bubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    maxWidth: "75%",
    flexShrink: 1, //  버블이 내용에 맞춰 줄어들 수 있게
  },
  myBubble: {
    backgroundColor: PURPLE,
    borderBottomRightRadius: 4,
    marginLeft: 6,
  },
  otherBubble: {
    backgroundColor: GRAY,
    borderBottomLeftRadius: 4,
    marginRight: 6,
  },

  text: {
    fontSize: 14,
    color: "#1b1b1b",
    lineHeight: 20,
    ...(Platform.OS === "web"
      ? {
          wordBreak: "keep-all" as any, //  한글은 어절 기준
          whiteSpace: "pre-wrap" as any, //  줄바꿈 허용 + 공백/개행 유지
          overflowWrap: "anywhere" as any, // 공백 없는 초장문도 버블 안에서 강제 줄바꿈
        }
      : {}),
  },

  time: { fontSize: 11, color: TIME },
  timeMine: { alignSelf: "flex-end", marginRight: 6 },
  timeOther: { alignSelf: "flex-end" },
});
