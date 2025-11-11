package com.zzaptalk.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.List;

@Getter
@AllArgsConstructor
public class ChatRoomResponse {

    private Long roomId;                     // 생성된 채팅방 ID
    private String roomName;                 // 채팅방 이름
    private List<String> memberNicknames;    // 참여 사용자 닉네임 목록

}