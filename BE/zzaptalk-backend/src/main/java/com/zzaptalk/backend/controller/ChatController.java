package com.zzaptalk.backend.controller;

import com.zzaptalk.backend.model.ChatMessage;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    @MessageMapping("/chat.sendMessage.{roomId}")
    @SendTo("/topic/chat.{roomId}")
    public ChatMessage sendMessage(@DestinationVariable String roomId, ChatMessage message) {
        System.out.println("📩 [" + roomId + "] " + message.getSender() + ": " + message.getContent());
        return message;
    }

}