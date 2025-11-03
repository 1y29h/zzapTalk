package com.zzaptalk.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;

@Configuration
@EnableWebSecurity    // Spring Security 활성화
public class SecurityConfig {

    // -------------------------------------------------------------------------
    // Http 보안 설정 (접근 권한, CSRF 등)
    // -------------------------------------------------------------------------

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // CSRF (Cross-Site Request Forgery) 보호 비활성화
                // REST API 서버에서는 보통 세션 대신 토큰 기반 인증을 사용하므로 비활성화
                .csrf(AbstractHttpConfigurer::disable)

                // 폼 로그인 비활성화
                // API 서버는 클라이언트에서 직접 인증 정보를 받아 처리하므로 불필요
                .formLogin(AbstractHttpConfigurer::disable)

                // HTTP 기본 인증 비활성화
                // 사용자 인증은 JWT 등의 토큰으로 처리할 예정
                .httpBasic(AbstractHttpConfigurer::disable)

                // 인가(접근 권한) 설정
                .authorizeHttpRequests(auth -> auth
                        // 회원가입 API와 WebSocket 연결 경로는 인증 없이 접근 허용
                        // 현재는 모든 경로를 열어둠. 나중에 제한 필요
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