package com.zzaptalk.backend.repository;

import com.zzaptalk.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // 전화번호로 사용자 찾기
    Optional<User> findByPhoneNumber(String phoneNumber);
    
    // 주민번호로 사용자 찾기
    Optional<User> findByResidentNumber(String residentNumber);
    
    // 전화번호 중복 체크
    boolean existsByPhoneNumber(String phoneNumber);
    
    // 주민번호 중복 체크
    boolean existsByResidentNumber(String residentNumber);
}

