// src/styles/friends/Friends.module.ts
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  container: {
    flex: 1,
  },

  // 상단바
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: "#f4f4f4",
  },
  headerLeft: {
    width: 40,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    width: 80,
  },
  headerIcon: {
    marginLeft: 10,
    color: "#333",
  },

  // 내 프로필
  myProfileSection: {
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: "#f0f0f0",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
  },
  myProfileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  myProfileName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },

  // 검색바
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e2e2",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
    paddingVertical: 0,
    color: "#333",
  },

  friendCount: {
    marginTop: 12,
    marginHorizontal: 16,
    fontSize: 12,
    color: "#666",
  },

  // 친구 리스트
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  friendName: {
    fontSize: 14,
    color: "#222",
  },
  emptyBox: {
    alignItems: "center",
    marginTop: 24,
  },
  emptyText: {
    fontSize: 13,
    color: "#999",
  },

  // =====================
  // 애니메이션 BottomSheet
  // =====================

  // 어두운 배경 레이어
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end", // 아래쪽에 카드 배치
  },
  // 배경 터치 영역 (Pressable)
  modalBackdropTouch: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // 아래에서 올라오는 카드
  modalCardBottom: {
    backgroundColor: "#fff",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#222",
  },
  modalTabs: {
    flexDirection: "row",
    marginBottom: 12,
  },
  modalTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  modalTabActive: {
    borderBottomColor: "#7c83ff",
  },
  modalTabText: {
    fontSize: 13,
    color: "#999",
  },
  modalTabTextActive: {
    color: "#7c83ff",
    fontWeight: "600",
  },
  modalBody: {
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: "#333",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  modalCancelText: {
    fontSize: 13,
    color: "#666",
  },
  modalConfirmBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#7c83ff",
  },
  modalConfirmText: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "500",
  },
});
