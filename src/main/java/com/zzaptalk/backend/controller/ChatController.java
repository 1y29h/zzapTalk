package com.zzaptalk.backend.controller;

import com.zzaptalk.backend.dto.ChatMessageRequest;
import com.zzaptalk.backend.dto.ChatMessageResponse;
import com.zzaptalk.backend.entity.ChatMessage;
import com.zzaptalk.backend.entity.User;
import com.zzaptalk.backend.service.ChatMessageService;
import com.zzaptalk.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatMessageService chatMessageService;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserService userService;

    @MessageMapping("/chat/message")
    public void sendMessage(ChatMessageRequest request, Principal principal) {

        log.info("===== ChatController.sendMessage 실행 =====");
        log.info("Principal: {}", principal);
        log.info("Principal name: {}", principal != null ? principal.getName() : "null");

        if (principal == null) {
            throw new SecurityException("인증되지 않은 사용자입니다.");
        }

        Long senderId;
        try {
            senderId = Long.parseLong(principal.getName());
        } catch (NumberFormatException e) {
            log.error("Principal name이 유효한 ID 형태가 아닙니다: {}", principal.getName());
            throw new SecurityException("유효하지 않은 사용자 인증 정보입니다.", e);
        }

        log.info("발신자 사용자 ID: {}", senderId);

        // User 조회 (전화번호로 찾기)
        User sender = userService.findUserById(senderId);

        // 메시지 저장
        ChatMessage savedMessage = chatMessageService.saveAndPublishMessage(
                request.getRoomId(),
                sender,
                request.getContent()
        );

        ChatMessageResponse response = ChatMessageResponse.fromEntity(savedMessage, sender.getNickname());

        String destination = "/topic/chat/room/" + request.getRoomId();
        messagingTemplate.convertAndSend(destination, response);

        log.info("메시지 전송 완료!");
    }
}