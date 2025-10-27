package com.zzaptalk.backend.service;

import com.zzaptalk.backend.dto.ChatRoomResponse;
import com.zzaptalk.backend.entity.ChatRoom;
import com.zzaptalk.backend.entity.User;
import com.zzaptalk.backend.repository.ChatRoomRepository;
import com.zzaptalk.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ChatRoomService {
    
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;
    
    /**
     * 현재 사용자의 모든 채팅방 조회
     */
    @Transactional(readOnly = true)
    public List<ChatRoomResponse> getUserChatRooms(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        List<ChatRoom> chatRooms = chatRoomRepository.findByUser(user);
        
        return chatRooms.stream()
                .map(chatRoom -> ChatRoomResponse.from(chatRoom, userId))
                .collect(Collectors.toList());
    }
    
    /**
     * 사용자가 지정한 roomId로 채팅방 생성
     */
    public ChatRoomResponse createChatRoom(Long userId, String roomId, Long otherUserId) {
        // roomId 중복 체크
        if (chatRoomRepository.findByRoomId(roomId).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 채팅방 이름입니다.");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new IllegalArgumentException("상대방을 찾을 수 없습니다."));
        
        // 두 사용자 간에 이미 채팅방이 있는지 확인
        if (chatRoomRepository.findByTwoUsers(user, otherUser).isPresent()) {
            throw new IllegalArgumentException("이미 해당 사용자와의 채팅방이 존재합니다.");
        }
        
        // 새로운 채팅방 생성
        ChatRoom newChatRoom = ChatRoom.builder()
                .roomId(roomId)
                .user1(user)
                .user2(otherUser)
                .build();
        
        ChatRoom savedChatRoom = chatRoomRepository.save(newChatRoom);
        return ChatRoomResponse.from(savedChatRoom, userId);
    }
    
    /**
     * 특정 사용자와의 채팅방 조회 (기존 채팅방만 조회, 생성하지 않음)
     */
    public ChatRoomResponse getChatRoomWithUser(Long userId, Long otherUserId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new IllegalArgumentException("상대방을 찾을 수 없습니다."));
        
        // 기존 채팅방 조회
        ChatRoom chatRoom = chatRoomRepository.findByTwoUsers(user, otherUser)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자와의 채팅방이 존재하지 않습니다."));
        
        return ChatRoomResponse.from(chatRoom, userId);
    }
    
    /**
     * roomId로 채팅방 조회
     */
    @Transactional(readOnly = true)
    public ChatRoomResponse getChatRoomByRoomId(String roomId, Long userId) {
        ChatRoom chatRoom = chatRoomRepository.findByRoomId(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다."));
        
        // 현재 사용자가 해당 채팅방에 속해있는지 확인
        if (!chatRoom.getUser1().getId().equals(userId) && 
            !chatRoom.getUser2().getId().equals(userId)) {
            throw new IllegalArgumentException("해당 채팅방에 접근할 권한이 없습니다.");
        }
        
        return ChatRoomResponse.from(chatRoom, userId);
    }
    
    /**
     * 채팅방의 마지막 메시지 업데이트
     */
    public void updateLastMessage(String roomId, String message) {
        ChatRoom chatRoom = chatRoomRepository.findByRoomId(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다."));
        
        chatRoom.setLastMessage(message);
        chatRoom.setLastMessageTime(java.time.LocalDateTime.now());
        chatRoomRepository.save(chatRoom);
    }
}

