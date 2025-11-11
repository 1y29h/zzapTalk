package com.zzaptalk.backend.controller;

import com.zzaptalk.backend.dto.ChatRoomCreationResult;
import com.zzaptalk.backend.dto.GroupChatRoomRequest;
import com.zzaptalk.backend.dto.ChatRoomResponse;
import com.zzaptalk.backend.dto.SingleChatRoomRequest;
import com.zzaptalk.backend.entity.ChatRoom;
import com.zzaptalk.backend.service.ChatRoomService;
import com.zzaptalk.backend.service.CustomUserDetails;
import com.zzaptalk.backend.repository.UserRepository;
import com.zzaptalk.backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat/rooms")
public class ChatRoomController {

    private final ChatRoomService chatRoomService;
    private final UserRepository userRepository;

    // -------------------------------------------------------------------------
    // 단톡
    // -------------------------------------------------------------------------

    @PostMapping("/group")
    public ResponseEntity<ChatRoomResponse> createGroupChatRoom(
            @RequestBody GroupChatRoomRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        // JWT 토큰에서 현재 로그인한 사용자(방장)의 ID를 가져와 User 엔티티 조회
        Long currentUserId = userDetails.getUserId();
        User creatorUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("인증된 사용자 정보를 찾을 수 없습니다. ID: " + currentUserId));

        // 서비스를 호출하여 채팅방 생성(메서드명: createGroupRoom)
        ChatRoomResponse response = chatRoomService.createGroupRoom(
                creatorUser,
                request
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // -------------------------------------------------------------------------
    // 갠톡
    // -------------------------------------------------------------------------

    @PostMapping("/single")
    public ResponseEntity<ChatRoomResponse> findOrCreateSingleChatRoom(
            @RequestBody SingleChatRoomRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        // 현재 로그인된 사용자(User A) 조회
        Long currentUserId = userDetails.getUserId();
        User userA = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("인증된 사용자 정보를 찾을 수 없습니다."));

        // 상대방 사용자(User B) 조회
        Long targetUserId = request.getTargetUserId();
        if (currentUserId.equals(targetUserId)) {
            throw new IllegalArgumentException("자기 자신과 1:1 채팅방을 만들 수 없습니다.");
        }

        User userB = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("상대방 사용자 ID를 찾을 수 없습니다. ID: " + targetUserId));

        // 1:1 채팅방 생성 또는 조회 서비스 호출
        ChatRoomCreationResult result = chatRoomService.findOrCreateSingleChatRoom(userA, userB);
        ChatRoom chatRoom = result.chatRoom();

        // 응답 DTO 생성
        List<String> memberNicknames = List.of(userA.getNickname(), userB.getNickname());

        ChatRoomResponse response = new ChatRoomResponse(
                chatRoom.getId(),
                chatRoom.getName(), // 보통 null
                memberNicknames
        );

        if (result.isNew()) {
            // 새로 생성된 경우: 201 Created 반환
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else {
            // 기존 방을 찾은 경우: 200 OK 반환
            return ResponseEntity.ok(response);
        }

    }

    // 예외 처리
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException e) {
        // HTTP 400 Bad Request와 함께 서비스에서 던진 오류 메시지를 반환
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(e.getMessage());
    }

}