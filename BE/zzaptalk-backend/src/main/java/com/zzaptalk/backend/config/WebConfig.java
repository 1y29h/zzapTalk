package com.zzaptalk.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class WebConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOrigins(Arrays.asList(
                "https://api.zzaptalk.com",    // 백엔드 도메인
                "https://zzaptalk.com",        // 프론트엔드 도메인 (민서가 사용할)
                "http://localhost:5173"        // 로컬 개발용
        ));
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        // ✅ 응답 헤더가 Tomcat WebSocket handshake에도 붙도록 전역 등록
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
