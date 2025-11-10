import { StyleSheet, Platform } from "react-native";

const PURPLE = "#C9C8FF";
const GRAY = "#EFEFEF";
const TIME = "#969696";

/** 화면 폭에서 좌우 여백/시간 영역 등을 뺀 버블 최대폭 (웹 전용) */
const WEB_MAX_BUBBLE = "calc(100vw - 120px)";

export default StyleSheet.create({
  wrap: { marginBottom: 8 },
  wrapMine: { alignItems: "flex-end" },
  wrapOther: { alignItems: "flex-start" },

  name: { fontSize: 11, color: "#777", marginBottom: 2 },

  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    maxWidth: "100%",
    // 줄바꿈 없이 가로로만 배치
    ...(Platform.OS === "web" ? ({ overflowX: "visible" } as any) : {}),
  },
  rowMine: { justifyContent: "flex-end" },
  rowOther: { justifyContent: "flex-start" },

  /** 말풍선 */
  bubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    // 콘텐츠 폭만큼 가로로 늘어나도록
    flexShrink: 0, // 🔑 줄어들며 개행/쪼개짐 방지
    ...(Platform.OS === "web"
      ? ({
          display: "inline-flex", // 콘텐츠 가로크기만큼
          width: "fit-content",
          maxWidth: WEB_MAX_BUBBLE, // 화면 밖으로 너무 안 나가게 상한
          overflowX: "auto", // 넘치면 버블 안에서 가로 스크롤
          overflowY: "hidden",
        } as any)
      : {}),
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

  /** 텍스트 */
  text: {
    fontSize: 14,
    color: "#1b1b1b",
    lineHeight: 20,
    ...(Platform.OS === "web"
      ? ({
          whiteSpace: "nowrap", // 🔑 절대 개행 금지
          wordBreak: "keep-all", // 한글 문자 단위 개행 방지
          display: "inline",
        } as any)
      : {}),
  },

  time: { fontSize: 11, color: TIME },
  timeMine: { alignSelf: "flex-end", marginRight: 6 },
  timeOther: { alignSelf: "flex-end" },
});
