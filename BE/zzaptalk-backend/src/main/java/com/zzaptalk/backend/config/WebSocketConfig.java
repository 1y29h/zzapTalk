package com.zzaptalk.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                // ✅ 프론트 ngrok 주소, 로컬 개발용 주소
                .setAllowedOriginPatterns(
                        "https://ctenidial-homely-frances.ngrok-free.dev",
                        "http://localhost:5173"
                )
                // ✅ SockJS 활성화
                .withSockJS()
                // ✅ 추가 안정화 설정
                .setStreamBytesLimit(512 * 1024)
                .setHttpMessageCacheSize(1000)
                .setSessionCookieNeeded(false) // ✅ 쿠키 안 붙게 해서 CORS 에러 차단
                // (optional) CDN에서 sockjs 클라이언트 불러오기 (iOS 대응)
                .setClientLibraryUrl("https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // ✅ 구독 prefix
        registry.enableSimpleBroker("/topic");
        // ✅ 메시지 전송 prefix
        registry.setApplicationDestinationPrefixes("/app");
    }
}