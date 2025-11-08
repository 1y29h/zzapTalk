package com.zzaptalk.backend.service;

import com.zzaptalk.backend.dto.UserSignUpRequest;
import com.zzaptalk.backend.entity.User;
import com.zzaptalk.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // SecurityConfig에서 주입

    // -------------------------------------------------------------------------
    // 회원가입
    // -------------------------------------------------------------------------

    @Transactional
    public void signUp(UserSignUpRequest request) {

        // 전화번호 중복 검사
        if (userRepository.existsByPhoneNum(request.getPhoneNum())) {
            throw new IllegalArgumentException("이미 가입된 전화번호입니다.");
        }

        // 비밀번호 단방향 암호화(해싱)
        String encodedPwd = passwordEncoder.encode(request.getPwd());

        // User 엔티티 생성
        User newUser = User.builder()
                .phoneNum(request.getPhoneNum())
                .pwd(encodedPwd)                // 암호화된 비밀번호 저장
                .name(request.getName())
                .nickname(request.getName())    // 닉네임 초기 설정: 본명
                .rrn(request.getRrn())
                .email(null)
                .zzapID(null)
                .build();

        userRepository.save(newUser);
    }

}