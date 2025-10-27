package com.zzaptalk.backend.controller;

import com.zzaptalk.backend.dto.ApiResponse;
import com.zzaptalk.backend.dto.UserResponse;
import com.zzaptalk.backend.entity.User;
import com.zzaptalk.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserRepository userRepository;
    
    /**
     * 모든 사용자 목록 조회 (채팅 상대 선택용)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            List<UserResponse> userResponses = users.stream()
                    .map(UserResponse::from)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(userResponses));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("사용자 목록 조회 중 오류가 발생했습니다."));
        }
    }
}

