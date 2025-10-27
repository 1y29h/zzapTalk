package com.zzaptalk.backend.service;

import com.zzaptalk.backend.dto.*;
import com.zzaptalk.backend.entity.User;
import com.zzaptalk.backend.repository.UserRepository;
import com.zzaptalk.backend.util.PhoneNumberFormatter;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    /**
     * 회원가입
     */
    public UserResponse signup(SignupRequest request) {
        // 비밀번호 확인 검증
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }
        
        // 전화번호 자동 포맷팅 (하이픈 추가)
        String formattedPhoneNumber = PhoneNumberFormatter.format(request.getPhoneNumber());
        
        // 전화번호 중복 체크
        if (userRepository.existsByPhoneNumber(formattedPhoneNumber)) {
            throw new IllegalArgumentException("이미 등록된 전화번호입니다.");
        }
        
        // 주민번호 중복 체크
        if (userRepository.existsByResidentNumber(request.getResidentNumber())) {
            throw new IllegalArgumentException("이미 등록된 주민번호입니다.");
        }
        
        // 사용자 생성
        User user = User.builder()
                .name(request.getName())
                .phoneNumber(formattedPhoneNumber)
                .residentNumber(request.getResidentNumber())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();
        
        User savedUser = userRepository.save(user);
        
        return UserResponse.from(savedUser);
    }
    
    /**
     * 로그인
     */
    public UserResponse login(LoginRequest request, HttpSession session) {
        // 전화번호 자동 포맷팅 (하이픈 추가)
        String formattedPhoneNumber = PhoneNumberFormatter.format(request.getPhoneNumber());
        
        // 전화번호로 사용자 찾기
        User user = userRepository.findByPhoneNumber(formattedPhoneNumber)
                .orElseThrow(() -> new IllegalArgumentException("전화번호 또는 비밀번호가 올바르지 않습니다."));
        
        // 비밀번호 확인
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("전화번호 또는 비밀번호가 올바르지 않습니다.");
        }
        
        // 세션에 사용자 정보 저장
        session.setAttribute("userId", user.getId());
        session.setAttribute("userName", user.getName());
        
        return UserResponse.from(user);
    }
    
    /**
     * 로그아웃
     */
    public void logout(HttpSession session) {
        session.invalidate();
    }
    
    /**
     * 비밀번호 재설정
     */
    public void resetPassword(ResetPasswordRequest request) {
        // 비밀번호 확인 검증
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }
        
        // 전화번호 자동 포맷팅 (하이픈 추가)
        String formattedPhoneNumber = PhoneNumberFormatter.format(request.getPhoneNumber());
        
        // 전화번호와 주민번호로 사용자 찾기 (본인 확인)
        User user = userRepository.findByPhoneNumber(formattedPhoneNumber)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        // 주민번호 확인
        if (!user.getResidentNumber().equals(request.getResidentNumber())) {
            throw new IllegalArgumentException("본인 확인에 실패했습니다.");
        }
        
        // 비밀번호 변경
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
    
    /**
     * 현재 로그인된 사용자 조회
     */
    @Transactional(readOnly = true)
    public User getCurrentUser(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            throw new IllegalStateException("로그인이 필요합니다.");
        }
        
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("사용자를 찾을 수 없습니다."));
    }
    
    /**
     * 세션에서 사용자 ID 가져오기
     */
    public Long getUserIdFromSession(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            throw new IllegalStateException("로그인이 필요합니다.");
        }
        return userId;
    }
}

