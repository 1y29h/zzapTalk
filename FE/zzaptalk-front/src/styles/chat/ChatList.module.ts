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
  rowSub: { marginTop: 3, fontSize: 13, color: "#6b7280" },
  sep: { height: 1, backgroundColor: "#f1f5f9", marginLeft: 16 + 44 + 16 }, // 76 -> 76 유지 로직화

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
    padding: 20,
  },
  errorText: { color: "#ef4444", fontSize: 14, textAlign: "center" },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#111827",
  },
  retryText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  emptyText: { color: "#6b7280", fontSize: 14 },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e5e7eb",
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: { fontSize: 18, fontWeight: "600", color: "#4b5563" },
  avatarImage: { width: 44, height: 44, borderRadius: 22 },
});
