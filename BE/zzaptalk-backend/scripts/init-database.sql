-- zzapTalk 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS zzaptalk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE zzaptalk;

-- 테이블은 JPA가 자동으로 생성하므로 수동 생성 불필요
-- 하지만 참고용으로 스키마를 남겨둡니다.

-- 사용자 테이블 (JPA가 자동 생성)
-- CREATE TABLE users (
--     id BIGINT PRIMARY KEY AUTO_INCREMENT,
--     name VARCHAR(50) NOT NULL,
--     phone_number VARCHAR(20) UNIQUE NOT NULL,
--     resident_number VARCHAR(10) UNIQUE NOT NULL,
--     password VARCHAR(255) NOT NULL,
--     created_at DATETIME NOT NULL,
--     updated_at DATETIME NOT NULL
-- );

-- 채팅방 테이블 (JPA가 자동 생성)
-- CREATE TABLE chat_rooms (
--     id BIGINT PRIMARY KEY AUTO_INCREMENT,
--     room_id VARCHAR(100) UNIQUE NOT NULL,
--     user1_id BIGINT NOT NULL,
--     user2_id BIGINT NOT NULL,
--     last_message VARCHAR(500),
--     last_message_time DATETIME,
--     created_at DATETIME NOT NULL,
--     FOREIGN KEY (user1_id) REFERENCES users(id),
--     FOREIGN KEY (user2_id) REFERENCES users(id)
-- );

-- 채팅 메시지 테이블 (JPA가 자동 생성)
-- CREATE TABLE chat_messages (
--     id BIGINT PRIMARY KEY AUTO_INCREMENT,
--     chat_room_id BIGINT NOT NULL,
--     sender_id BIGINT NOT NULL,
--     receiver_id BIGINT NOT NULL,
--     content VARCHAR(1000) NOT NULL,
--     created_at DATETIME NOT NULL,
--     FOREIGN KEY (chat_room_id) REFERENCES chat_rooms(id),
--     FOREIGN KEY (sender_id) REFERENCES users(id),
--     FOREIGN KEY (receiver_id) REFERENCES users(id)
-- );

