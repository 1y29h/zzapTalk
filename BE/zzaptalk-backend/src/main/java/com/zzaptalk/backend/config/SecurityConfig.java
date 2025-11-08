package com.zzaptalk.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.web.cors.CorsConfiguration;
import java.util.Arrays;

@Configuration
@EnableWebSecurity    // Spring Security 활성화
public class SecurityConfig {

    // -------------------------------------------------------------------------
    // Http 보안 설정 (접근 권한, CSRF 등)
    // -------------------------------------------------------------------------

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // CORS 설정
                .cors(cors -> cors
                        .configurationSource(request -> {
                            CorsConfiguration config = new CorsConfiguration();
                            // React 개발 서버 주소 허용 (필수)
                            config.setAllowedOrigins(Arrays.asList(
                                    "http://localhost:3000",
                                    "http://localhost:8081",    // 민서 React 포트
                                    "https://zzaptalk.com/",
                                    "https://libelously-reliant-garland.ngrok-free.dev"));
                            // 모든 메서드(POST, GET 등) 허용
                            config.setAllowedMethods(Arrays.asList("POST", "GET", "PUT", "DELETE", "OPTIONS"));
                            // 인증 정보(쿠키, 헤더) 전송 허용
                            config.setAllowCredentials(true);
                            // 모든 헤더 허용
                            config.setAllowedHeaders(Arrays.asList("*"));
                            return config;
                        })
                )

                // CSRF(Cross-Site Request Forgery) 보호 비활성화
                .csrf(AbstractHttpConfigurer::disable)

                // 폼 로그인 비활성화
                .formLogin(AbstractHttpConfigurer::disable)

                // HTTP 기본 인증 비활성화
                .httpBasic(AbstractHttpConfigurer::disable)

                // 인가(접근 권한) 설정
                .authorizeHttpRequests(auth -> auth
                        // 회원가입 API와 WebSocket 연결 경로는 인증 없이 접근 허용
                        .requestMatchers("/api/v1/users/signup", "/ws/**").permitAll()
                        // 그 외 모든 요청은 인증 필요
                        .anyRequest().authenticated()
                );

        return http.build();
    }

    // -------------------------------------------------------------------------
    // 비밀번호 암호화(해싱)를 위한 PasswordEncoder Bean 등록
    // 이 Bean을 UserService에 주입받아 사용
    // -------------------------------------------------------------------------

    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt: 단방향 해싱 알고리즘
        return new BCryptPasswordEncoder();
    }

}