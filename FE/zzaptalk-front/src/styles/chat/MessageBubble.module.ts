import { StyleSheet } from "react-native";

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
  },
  myBubble: {
    backgroundColor: PURPLE,
    borderBottomRightRadius: 4,
    // 내 메시지에서는 시간(왼쪽)과 간격은 timeMine에서 처리
    marginLeft: 6,
  },
  otherBubble: {
    backgroundColor: GRAY,
    borderBottomLeftRadius: 4,
    marginRight: 6, // 시간과 간격(오른쪽)
  },

  text: { fontSize: 14, color: "#1b1b1b" },

  time: { fontSize: 11, color: TIME },
  timeMine: { alignSelf: "flex-end", marginRight: 6 }, // [시간, 버블] 간격
  timeOther: { alignSelf: "flex-end" }, // [버블, 시간] 간격은 bubble에서
});
