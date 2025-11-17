package com.zzaptalk.backend.config;

import com.zzaptalk.backend.jwt.JwtAuthenticationFilter;
import com.zzaptalk.backend.util.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;

    // -------------------------------------------------------------------------
    // Http 보안 설정
    // -------------------------------------------------------------------------

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // JWT 기반 인증이므로 세션 사용 안 함
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // CSRF(Cross-Site Request Forgery) 비활성화
                // JWT 사용시 필수
                .csrf(AbstractHttpConfigurer::disable)

                // 폼 로그인, HTTP 기본 인증 비활성화
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)

                // 인가(접근 권한) 설정
                .authorizeHttpRequests(auth -> auth

                        // 회원가입, 로그인, WebSocket 경로는 인증 없이 접근 허용
                        .requestMatchers(
                                "/api/v1/users/signup",
                                "/api/v1/users/login",
                                "/ws/**"
                        ).permitAll()

                        .requestMatchers(
                                               // WebSocket 연결 엔드포인트
                                "/api/chat/rooms/**"    // 채팅방 관련 API
                        ).authenticated()

                        // 그 외 모든 요청은 인증 필요
                        .anyRequest().authenticated()

                )

                // JWT 인증 필터 등록
                // Spring Security 기본 필터인 UsernamePasswordAuthenticationFilter 이전에 실행
                .addFilterBefore(
                    new JwtAuthenticationFilter(jwtTokenProvider),
                    UsernamePasswordAuthenticationFilter.class
                )

                // CORS 설정
                .cors(cors -> cors
                        .configurationSource(request -> {
                            CorsConfiguration config = new CorsConfiguration();
                            // React 개발 서버 주소 허용
                            config.setAllowedOrigins(Arrays.asList(
                                    "http://localhost:3000",
                                    "http://localhost:8081",    // 민서 React 포트
                                    "https://zzaptalk.com/",
                                    "https://zzaptalk.pages.dev",
                                    "https://libelously-reliant-garland.ngrok-free.dev"));    // ngrok
                            // 모든 메서드(POST, GET 등) 허용
                            config.setAllowedMethods(Arrays.asList("POST", "GET", "PUT", "DELETE", "OPTIONS"));
                            // 모든 헤더 허용
                            config.setAllowedHeaders(Arrays.asList("*"));
                            // 인증 정보(쿠키, 헤더) 전송 허용
                            config.setAllowCredentials(true);
                            return config;
                        })
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