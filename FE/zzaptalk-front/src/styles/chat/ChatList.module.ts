// src/styles/chat/ChatList.module.ts
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  listContent: { paddingBottom: 24 },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
    fontWeight: "700",
    color: "#6b7280",
    backgroundColor: "#f8fafc",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
  },
  rowTextWrap: { flex: 1, marginRight: 10 },
  rowTitle: { fontSize: 16, fontWeight: "600", color: "#111827" },
  rowSub: { marginTop: 3, fontSize: 12, color: "#6b7280" },
  sep: { height: 1, backgroundColor: "#f1f5f9", marginLeft: 16 },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  errorText: { color: "#ef4444" },
  retryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#111827",
  },
  retryText: { color: "#fff", fontSize: 13 },
  emptyText: { color: "#6b7280" },
});
