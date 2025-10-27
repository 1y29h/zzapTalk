package com.zzaptalk.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateChatRoomRequest {
    
    @NotBlank(message = "채팅방 이름(roomId)은 필수입니다.")
    private String roomId; // 사용자가 직접 설정하는 채팅방 이름
    
    @NotNull(message = "상대방 ID는 필수입니다.")
    private Long otherUserId; // 채팅 상대방의 ID
}

