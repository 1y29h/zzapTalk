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
    marginRight: 6, // 시간과 간격
  },
  otherBubble: {
    backgroundColor: GRAY,
    borderBottomLeftRadius: 4,
    marginRight: 6,
  },

  text: { fontSize: 14, color: "#1b1b1b" },

  time: { fontSize: 11, color: TIME },
  timeMine: { alignSelf: "flex-end" },
  timeOther: { alignSelf: "flex-end" },
});
