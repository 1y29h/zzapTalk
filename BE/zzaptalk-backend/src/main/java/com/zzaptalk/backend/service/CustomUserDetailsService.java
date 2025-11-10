package com.zzaptalk.backend.service;

import com.zzaptalk.backend.entity.User;
import com.zzaptalk.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        // 1. phoneNum으로 조회
        Optional<User> userOptional = userRepository.findByPhoneNum(username);

        // 2. email로 조회 (phoneNum으로 못 찾은 경우)
        if (userOptional.isEmpty()) {
            userOptional = userRepository.findByEmail(username);
        }

        // 3. zzapID로 조회 (email로도 못 찾은 경우)
        if (userOptional.isEmpty()) {
            userOptional = userRepository.findByZzapID(username);
        }

        // 4. CustomUserDetails로 래핑하여 반환 ◀◀◀ 변경된 부분
        return userOptional
                .map(CustomUserDetails::new)  // User -> CustomUserDetails 변환
                .orElseThrow(() -> new UsernameNotFoundException(
                        "해당 사용자를 찾을 수 없습니다: " + username
                ));
    }
}