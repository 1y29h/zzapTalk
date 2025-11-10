package com.zzaptalk.backend.service;

import com.zzaptalk.backend.repository.UserRepository;
import com.zzaptalk.backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    // Spring Security에서 사용자를 인증할 때 JWT 토큰의 Subject(식별자)를 통해 호출
    // Subject(username)를 사용하여 PhoneNum, Email, ZzapID 순으로 사용자를 조회

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        // UserRepository를 사용하여 DB에서 사용자 Entity 찾기
        Optional<User> userOptional = userRepository.findByPhoneNum(username);

        if (userOptional.isEmpty()) {
            userOptional = userRepository.findByEmail(username);
        }
        if (userOptional.isEmpty()) {
            userOptional = userRepository.findByZzapID(username);
        }
        return userOptional
                .map(this::createUserDetails)
                .orElseThrow(() -> new UsernameNotFoundException("해당 사용자를 찾을 수 없습니다: " + username));

    }

    // DB에서 가져온 User Entity 정보를 Spring Security의 UserDetails 형식으로 변환
    private UserDetails createUserDetails(User user) {
        // 권한 목록 설정
        return new org.springframework.security.core.userdetails.User(
                user.getPhoneNum(),    // 사용자 식별자
                user.getPwd(),         // 암호화된 비밀번호
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );
    }

}