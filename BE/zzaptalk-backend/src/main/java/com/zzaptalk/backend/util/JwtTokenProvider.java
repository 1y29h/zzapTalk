package com.zzaptalk.backend.util;

import com.zzaptalk.backend.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    // application-local.yml에서 secret 주입
    @Value("${jwt.secret}")
    private String secretKey;

    // application-local.yml에서 expiration 주입
    @Value("${jwt.expiration}")
    private long tokenExpiration;

    private Key key;

    // -------------------------------------------------------------------------
    // 초기화: Base64 secretKey -> Key 객체로 변환
    // -------------------------------------------------------------------------

    @PostConstruct
    public void init() {
        // Base64 디코딩
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        // HMAC SHA-256 알고리즘에 맞는 Key 객체 생성
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    // -------------------------------------------------------------------------
    // JWT 토큰 생성 메서드
    // -------------------------------------------------------------------------

    // 로그인에 성공한 User 객체를 받아 JWT 토큰 생성
    public String createToken(User user) {

        // Claims(토큰에 담을 정보) 설정
        // 토큰 주제(sub)는 ZzapID, email 또는 phoneNum 중 하나로 설정
        String identifier = user.getPhoneNum();
        if (user.getZzapID() != null) {
            identifier = user.getZzapID();
        } else if (user.getEmail() != null) {
            identifier = user.getEmail();
        }

        Claims claims = Jwts.claims().setSubject(identifier);
        claims.put("userId", user.getId());
        claims.put("nickname", user.getNickname());

        // 만료 시간 설정
        Date now = new Date();
        Date validity = new Date(now.getTime() + tokenExpiration);

        // 토큰 빌드 및 서명
        return Jwts.builder()
                .setClaims(claims)                          // 정보 저장
                .setIssuedAt(now)                           // 토큰 발행 시간
                .setExpiration(validity)                    // 토큰 만료 시간
                .signWith(key, SignatureAlgorithm.HS256)    // 서명 알고리즘 및 비밀 키 사용
                .compact();                                 // 토큰 압축

    }

}