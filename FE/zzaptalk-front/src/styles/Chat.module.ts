import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  /* header */
  header: {
    height: 56,
    borderBottomWidth: 0.7,
    borderColor: "#E6E6E6",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBtn: { padding: 6 },
  headerIcon: { fontSize: 22 },
  headerSmallIcon: { fontSize: 18, marginLeft: 8 },
  headerTitle: { fontSize: 16, fontWeight: "600" },
  headerRight: { flexDirection: "row", alignItems: "center" },

  /* list */
  list: { flex: 1 },
  listContent: { padding: 12, paddingBottom: 8 },

  rowOther: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 4,
  },
  rowMine: {
    flexDirection: "row-reverse",
    alignItems: "flex-end",
    marginVertical: 4,
  },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#D9D9D9",
    marginRight: 8,
  },

  bubbleOther: {
    maxWidth: "72%",
    backgroundColor: "#EFEFEF",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleMine: {
    maxWidth: "72%",
    backgroundColor: "#C9C7FF",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  msgText: { fontSize: 15 },
  timeText: { fontSize: 10, color: "#999", marginHorizontal: 6 },

  /* actions */
  actionPanel: {
    borderTopWidth: 0.7,
    borderColor: "#E6E6E6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FAFAFA",
  },
  actionBtn: {
    flex: 1,
    marginRight: 8,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E3EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  actionTxt: { fontSize: 13 },

  /* input bar */
  inputBar: {
    borderTopWidth: 0.7,
    borderColor: "#E6E6E6",
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#fff",
  },
  plusBtn: { paddingHorizontal: 6, paddingVertical: 4 },
  plusIcon: { fontSize: 24 },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F6F7FB",
    borderRadius: 18,
    fontSize: 15,
    marginHorizontal: 6,
  },
  emojiBtn: { paddingHorizontal: 6, paddingVertical: 4 },
  emojiIcon: { fontSize: 20 },
  sendBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#7C82FF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  sendBtnDisabled: { backgroundColor: "#CDD0FF" },
  sendText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  /* modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCard: {
    width: "86%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1.5,
    borderColor: "#1a73e8",
  },
  modalTitle: { fontSize: 16, marginBottom: 10 },
  modalInput: {
    borderWidth: 1,
    borderColor: "#1a73e8",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  modalBtns: { flexDirection: "row", justifyContent: "flex-end" },
  modalConfirm: {
    backgroundColor: "#1a73e8",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 6,
  },
  modalConfirmText: { color: "#fff", fontWeight: "700" },
  modalCancel: {
    backgroundColor: "#e9eef6",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 6,
    marginLeft: 8,
  },
  modalCancelText: { color: "#444" },
});
