import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 88,
    gap: 6,
  },
  // 날짜 구분선
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
    gap: 10,
  },
  dateLine: {
    height: 1,
    backgroundColor: "#e4e4e4",
    flex: 1,
  },
  dateLabel: {
    color: "#8a8a8a",
    fontSize: 12,
  },
});

export default styles;
