package com.zzaptalk.backend.controller;

import com.zzaptalk.backend.model.ChatMessage;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

/**
 * 클라이언트가 /app/sendMessage 로 메시지를 보내면
 * 서버가 /topic/public 으로 다시 뿌려줌
 */

@Controller
public class ChatController {

    // ex) 클라이언트가 /app/chat.sendMessage.room1 으로 보내면
    // 서버는 /topic/chat.room1 구독자들에게 전송
    @MessageMapping("/chat.sendMessage.{roomId}")
    @SendTo("/topic/chat.{roomId}")
    public ChatMessage sendMessage(@DestinationVariable String roomId, ChatMessage message) {
        System.out.println("📩 [" + roomId + "] " + message.getSender() + ": " + message.getContent());
        return message;    // 다시 클라이언트들에게 전달됨
    }

}