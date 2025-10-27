package com.zzaptalk.backend.repository;

import com.zzaptalk.backend.entity.ChatMessageEntity;
import com.zzaptalk.backend.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, Long> {
    
    // 특정 채팅방의 모든 메시지 조회
    List<ChatMessageEntity> findByChatRoomOrderByCreatedAtAsc(ChatRoom chatRoom);
}

