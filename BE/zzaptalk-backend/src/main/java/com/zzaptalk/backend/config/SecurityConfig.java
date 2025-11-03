//package com.zzaptalk.backend.config;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.security.web.SecurityFilterChain;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//
//@Configuration
//@EnableWebSecurity
//public class SecurityConfig {
//
//    @Bean
//    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//        http
//                // CORS 및 CSRF 방지 설정
//                .csrf(csrf -> csrf.disable()) // API 서버의 경우 일반적으로 CSRF 비활성화
//
//                // 인증 없이 접근을 허용할 경로 설정
//                .authorizeHttpRequests(authorize -> authorize
//                        .requestMatchers("/api/auth/**", "/swagger-ui/**").permitAll() // 회원가입, 로그인 등은 모두 접근 허용
//                        .anyRequest().authenticated() // 그 외의 모든 요청은 인증(로그인) 필요
//                );
//
//        // 향후 로그인/로그아웃, 세션/JWT 등을 구현할 위치
//
//        return http.build();
//    }
//
//    // 비밀번호 암호화 빈 추가(사용자 비밀번호 처리를 위해 필요)
//    @Bean
//    public PasswordEncoder passwordEncoder() {
//        // 가장 많이 사용되는 BCrypt 해시 함수 사용
//        return new BCryptPasswordEncoder();
//    }
//
//}