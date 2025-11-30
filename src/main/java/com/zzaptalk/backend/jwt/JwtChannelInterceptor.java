package com.zzaptalk.backend.jwt;

import com.zzaptalk.backend.util.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Principal;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtChannelInterceptor implements ChannelInterceptor {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }

        StompCommand command = accessor.getCommand();
        log.info("====== JwtChannelInterceptor 실행! Command: {} ======", command);

        if (StompCommand.CONNECT.equals(command)) {
            String authorizationHeader = accessor.getFirstNativeHeader("Authorization");
            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                String token = authorizationHeader.substring(7);
                if (jwtTokenProvider.validateToken(token)) {
                    Authentication authentication = jwtTokenProvider.getAuthentication(token);

                    // 세션에 저장
                    accessor.getSessionAttributes().put("authentication", authentication);

                    // Principal 래퍼 생성하여 설정 - 이게 핵심!
                    Principal principal = new Principal() {
                        @Override
                        public String getName() {
                            return authentication.getName();
                        }
                    };
                    accessor.setUser(principal);

                    log.info("WebSocket 인증 성공: User ID = {}", authentication.getName());
                }
            }
        }
        else if (StompCommand.SEND.equals(command) || StompCommand.SUBSCRIBE.equals(command)) {
            Authentication authentication =
                    (Authentication) accessor.getSessionAttributes().get("authentication");

            if (authentication != null) {
                // Principal 래퍼 생성하여 설정 - 이게 핵심!
                Principal principal = new Principal() {
                    @Override
                    public String getName() {
                        return authentication.getName();
                    }
                };
                accessor.setUser(principal);

                log.info("WebSocket 메시지 인증 복원: User ID = {}", authentication.getName());
            } else {
                log.warn("WebSocket 인증 실패: 세션에 인증 정보 없음");
            }
        }

        log.info("====== JwtChannelInterceptor 종료 ======");
        return message;
    }
}