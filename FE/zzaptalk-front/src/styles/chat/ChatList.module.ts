// src/styles/chat/ChatList.module.ts
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  // --- 기존 스타일 ---
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
  rowSub: { marginTop: 3, fontSize: 13, color: "#6b7280" }, // 글자 크기 12 -> 13으로 수정
  sep: { height: 1, backgroundColor: "#f1f5f9", marginLeft: 76 }, // 아바타 너비만큼 marginLeft 추가

  // --- 뱃지 스타일 (unreadCount) ---
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: "#ef4444", // 빨간색 뱃지
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  // --- 로딩/에러/빈 화면 스타일 ---
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 20, // 여백 추가
  },
  errorText: { color: "#ef4444", fontSize: 14, textAlign: "center" },
  retryBtn: {
    marginTop: 8, // 상단 여백 추가
    paddingHorizontal: 14, // 좌우 여백 증가
    paddingVertical: 9, // 상하 여백 증가
    borderRadius: 8,
    backgroundColor: "#111827",
  },
  retryText: { color: "#fff", fontSize: 13, fontWeight: "600" }, // 폰트 굵기 추가
  emptyText: { color: "#6b7280", fontSize: 14 },

  // --- 🎨 [추가] 아바타 스타일 ---
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22, // 원형
    backgroundColor: "#e5e7eb", // 회색 배경
    marginRight: 16, // 오른쪽 여백
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4b5563",
  },
  // (만약 실제 이미지를 쓴다면 avatar 스타일에 width/height/borderRadius만 적용)
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
});
