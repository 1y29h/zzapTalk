package com.zzaptalk.backend.service;

import com.zzaptalk.backend.entity.User;
import lombok.Getter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;

/**
 * Spring Security의 UserDetails를 구현한 커스텀 클래스
 * User 엔티티를 직접 참조할 수 있도록 래핑
 */
@Getter
public class CustomUserDetails extends org.springframework.security.core.userdetails.User {

    // User 엔티티를 직접 참조
    private final User user;

    public CustomUserDetails(User user) {
        // 부모 생성자 호출 (username, password, authorities)
        super(
                user.getPhoneNum(),  // 식별자 (phoneNum 사용)
                user.getPwd(),       // 비밀번호
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")) // 권한
        );
        this.user = user;
    }
}