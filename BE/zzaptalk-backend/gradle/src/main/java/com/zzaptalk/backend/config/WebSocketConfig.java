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
                .setAllowedOriginPatterns(
                        "http://localhost:5173",
                        "http://192.168.*.*",           // ✅ 같은 Wi-Fi 클라이언트 허용
                        "https://*.ngrok-free.app",     // ✅ ngrok 주소 자동 허용
                        "https://*.ngrok-free.dev",     // ✅ ngrok 주소 자동 허용
                        "https://*.ngrok.io"            // ✅ 구버전 ngrok 허용
                )
                .withSockJS()
                .setWebSocketEnabled(true)
                .setSessionCookieNeeded(false);

    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/app");
        registry.enableSimpleBroker("/topic");
    }
}
