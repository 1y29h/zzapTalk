package com.zzaptalk.backend.controller;

import com.zzaptalk.backend.dto.ChatMessageRequest;
import com.zzaptalk.backend.dto.ChatMessageResponse;
import com.zzaptalk.backend.entity.ChatMessage;
import com.zzaptalk.backend.entity.User;
import com.zzaptalk.backend.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Slf4j  // 추가!
@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatMessageService chatMessageService;
    private final SimpMessagingTemplate messagingTemplate;

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
            senderId = Long.valueOf(principal.getName());
            log.info("발신자 ID: {}", senderId);
        } catch (NumberFormatException e) {
            throw new SecurityException("유효하지 않은 인증 정보(사용자 ID)형식입니다.");
        }



        // ⭐️ User 엔티티 조회 (인증된 ID를 사용)
        // ChatMessageService에 해당 메서드가 있다고 가정합니다.
        User sender = chatMessageService.findUserById(senderId);

        // 메시지 저장 및 DB 업데이트(ChatMessageService 호출)
        // 검증 + 저장 한번에 처리
        // 오류 날 때 -> "saveAndPublishMessage" 로 바꾸기 (원래 검증로직 없던 저장만하는 것)
        ChatMessage savedMessage = chatMessageService.validateAndSendMessage(
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