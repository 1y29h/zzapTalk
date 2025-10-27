package com.zzaptalk.backend.dto;

import com.zzaptalk.backend.entity.ChatRoom;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomResponse {
    
    private Long id;
    private String roomId;
    private UserResponse otherUser; // 상대방 정보
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private LocalDateTime createdAt;
    
    public static ChatRoomResponse from(ChatRoom chatRoom, Long currentUserId) {
        // 현재 사용자가 아닌 상대방을 찾음
        UserResponse otherUser = chatRoom.getUser1().getId().equals(currentUserId)
                ? UserResponse.from(chatRoom.getUser2())
                : UserResponse.from(chatRoom.getUser1());
        
        return ChatRoomResponse.builder()
                .id(chatRoom.getId())
                .roomId(chatRoom.getRoomId())
                .otherUser(otherUser)
                .lastMessage(chatRoom.getLastMessage())
                .lastMessageTime(chatRoom.getLastMessageTime())
                .createdAt(chatRoom.getCreatedAt())
                .build();
    }
}

