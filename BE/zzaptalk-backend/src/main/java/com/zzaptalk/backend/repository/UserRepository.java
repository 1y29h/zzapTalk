package com.zzaptalk.backend.repository;

import com.zzaptalk.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    // 이메일 중복 체크
    boolean existsByEmail(String email);

    // 전화번호 중복 체크
    boolean existsByPhoneNum(String phoneNum);

    // ZzapTalk ID 중복 체크
    boolean existsByZzapID(String zzapID);

}