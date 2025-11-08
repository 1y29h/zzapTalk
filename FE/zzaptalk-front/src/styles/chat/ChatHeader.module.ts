import { StyleSheet } from "react-native";

export default StyleSheet.create({
  header: {
    height: 52,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // 얕은 그림자
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    gap: 6,
  },
  backBtn: {
    padding: 6,
    marginRight: 4,
  },
  title: {
    maxWidth: 200,
    fontSize: 16,
    fontWeight: "600",
    color: "#242424",
  },
  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBtn: {
    padding: 6,
  },
});
