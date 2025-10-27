package com.zzaptalk.backend.repository;

import com.zzaptalk.backend.entity.ChatRoom;
import com.zzaptalk.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    
    // roomId로 채팅방 찾기
    Optional<ChatRoom> findByRoomId(String roomId);
    
    // 특정 사용자가 참여한 모든 채팅방 조회
    @Query("SELECT cr FROM ChatRoom cr WHERE cr.user1 = :user OR cr.user2 = :user ORDER BY cr.lastMessageTime DESC")
    List<ChatRoom> findByUser(@Param("user") User user);
    
    // 두 사용자 간의 채팅방 찾기
    @Query("SELECT cr FROM ChatRoom cr WHERE (cr.user1 = :user1 AND cr.user2 = :user2) OR (cr.user1 = :user2 AND cr.user2 = :user1)")
    Optional<ChatRoom> findByTwoUsers(@Param("user1") User user1, @Param("user2") User user2);
}

