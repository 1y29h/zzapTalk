export type ChatRoomType = "SINGLE" | "GROUP";

export interface ChatRoomUserListItem {
  roomId: number;
  type: ChatRoomType;
  roomName: string;
  unreadCount: number;
  lastMessageTime?: string;
  lastMessageContent?: string;
}

export interface ChatRoomResponse {
  roomId: number;
  roomName: string;
  memberNicknames: string[];
}

export type MessageType = "TEXT" | "IMAGE" | "ENTER" | "LEAVE";

export interface ChatMessageResponse {
  messageId: number;
  roomId: number;
  senderId: number;
  senderName: string;
  content: string;
  type: MessageType;
  sentAt: string;
}
