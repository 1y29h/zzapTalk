package com.zzaptalk.backend.controller;

import com.zzaptalk.backend.dto.UserSignUpRequest;
import com.zzaptalk.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // -------------------------------------------------------------------------
    // 회원가입(Sign Up) API 엔드포인트
    // POST /api/v1/users/signup
    // -------------------------------------------------------------------------

    @PostMapping("/signup")
    // @Valid: DTO 유효성 검사(@NotBlank 등) 수행
    public ResponseEntity<String> signUp(@Valid @RequestBody UserSignUpRequest request) {

        try {
            // void 타입의 Service 메서드 호출
            userService.signUp(request);
            // 성공 시 HTTP 201 Created 응답 반환
            return ResponseEntity.status(HttpStatus.CREATED).body("회원가입이 성공적으로 완료되었습니다.");
        }

        catch (IllegalArgumentException e) {
            // Service 계층에서 발생시킨 중복 예외 처리(400 Bad Request)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }

        catch (Exception e) {
            // 기타 서버 오류 처리(500 Internal Server Error)
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("회원가입 중 서버 오류가 발생했습니다.");
        }

    }

}