package com.zzaptalk.backend.service;

import com.zzaptalk.backend.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.Collections;

// UserDetails 인터페이스를 구현하여 SecurityContext에 저장될 사용자 정보를 정의합니다.
@Getter
public class CustomUserDetails implements UserDetails {

    private final User user;
    private final Long userId;
    private final String password;

    public CustomUserDetails(User user) {
        this.user = user;
        this.userId = user.getId();
        this.password = user.getPwd();
    }

    @Override
    public String getUsername() {
        return String.valueOf(this.userId);
    }

    // 비밀번호 반환
    @Override
    public String getPassword() {
        return this.password;
    }

    // 권한 설정 (일반 사용자 권한만 부여)
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.emptyList();
    }

    // 계정 만료, 잠금, 자격 증명 만료, 활성화 여부는 필요에 따라 true로 설정
    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}