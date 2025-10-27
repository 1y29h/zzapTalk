package com.zzaptalk.backend.controller;

import com.zzaptalk.backend.dto.ApiResponse;
import com.zzaptalk.backend.dto.ChatRoomResponse;
import com.zzaptalk.backend.dto.CreateChatRoomRequest;
import com.zzaptalk.backend.service.ChatRoomService;
import com.zzaptalk.backend.service.UserService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat-rooms")
@RequiredArgsConstructor
public class ChatRoomController {
    
    private final ChatRoomService chatRoomService;
    private final UserService userService;
    
    /**
     * 현재 사용자의 모든 채팅방 목록 조회
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ChatRoomResponse>>> getUserChatRooms(HttpSession session) {
        try {
            Long userId = userService.getUserIdFromSession(session);
            List<ChatRoomResponse> chatRooms = chatRoomService.getUserChatRooms(userId);
            return ResponseEntity.ok(ApiResponse.success(chatRooms));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("채팅방 목록 조회 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 채팅방 생성 (사용자가 roomId 지정)
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ChatRoomResponse>> createChatRoom(
            @Valid @RequestBody CreateChatRoomRequest request,
            HttpSession session) {
        try {
            Long userId = userService.getUserIdFromSession(session);
            ChatRoomResponse chatRoom = chatRoomService.createChatRoom(
                    userId, 
                    request.getRoomId(), 
                    request.getOtherUserId()
            );
            return ResponseEntity.ok(ApiResponse.success("채팅방이 생성되었습니다.", chatRoom));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("채팅방 생성 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 특정 사용자와의 채팅방 조회
     */
    @GetMapping("/with/{otherUserId}")
    public ResponseEntity<ApiResponse<ChatRoomResponse>> getChatRoomWithUser(
            @PathVariable Long otherUserId,
            HttpSession session) {
        try {
            Long userId = userService.getUserIdFromSession(session);
            ChatRoomResponse chatRoom = chatRoomService.getChatRoomWithUser(userId, otherUserId);
            return ResponseEntity.ok(ApiResponse.success(chatRoom));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("채팅방 조회 중 오류가 발생했습니다."));
        }
    }
}

