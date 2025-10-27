package com.zzaptalk.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 50)
    private String name; // 이름
    
    @Column(nullable = false, unique = true, length = 20)
    private String phoneNumber; // 전화번호 (예: 010-1234-5678)
    
    @Column(nullable = false, unique = true, length = 10)
    private String residentNumber; // 주민번호 앞6자리 + 뒤1자리 (예: 9901011)
    
    @Column(nullable = false)
    private String password; // 암호화된 비밀번호
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}

