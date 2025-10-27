package com.zzaptalk.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOriginPatterns(
                                "http://localhost:5173",
                                "http://192.168.*.*",           // ✅ 같은 Wi-Fi 접속 허용
                                "https://*.ngrok-free.app",     // ✅ ngrok 자동 허용
                                "https://*.ngrok-free.dev",     // ✅ ngrok 자동 허용
                                "https://*.ngrok.io"            // ✅ 구버전 ngrok 허용
                        )
                        .allowedMethods("*")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
