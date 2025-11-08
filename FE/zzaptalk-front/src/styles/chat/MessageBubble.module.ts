import { StyleSheet, Platform } from "react-native";

const PURPLE = "#C9C8FF";
const GRAY = "#EFEFEF";
const TIME = "#969696";

export default StyleSheet.create({
  wrap: {
    marginBottom: 8,
  },
  wrapMine: { alignItems: "flex-end" },
  wrapOther: { alignItems: "flex-start" },

  name: {
    fontSize: 11,
    color: "#777",
    marginBottom: 2,
  },

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
    flexShrink: 0, // ✅ shrink 막기 (세로로 안쌓이게)
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

    // ✅ 웹에서 한 줄 유지 (카톡처럼 줄 안 바뀌게)
    ...(Platform.OS === "web"
      ? {
          wordBreak: "keep-all" as any,
          whiteSpace: "nowrap" as any, // 🔥 핵심: 자동 줄바꿈 금지
        }
      : {}),
  },

  time: { fontSize: 11, color: TIME },
  timeMine: { alignSelf: "flex-end", marginRight: 6 },
  timeOther: { alignSelf: "flex-end" },
});
