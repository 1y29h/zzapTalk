# zzapTalk Backend

실시간 채팅 애플리케이션 백엔드 API

## 기술 스택

- **Java 17**
- **Spring Boot 3.5.7**
- **Spring Security** - 비밀번호 암호화 및 세션 기반 인증
- **Spring Data JPA** - ORM
- **MySQL 8.0** - 데이터베이스
- **WebSocket** - 실시간 채팅
- **Lombok** - 코드 간소화

## 주요 기능

### 1. 인증 (Authentication)

#### 회원가입
- **엔드포인트**: `POST /api/auth/signup`
- **필수 정보**: 이름, 전화번호, 주민번호(앞6자리+뒤1자리), 비밀번호, 비밀번호 확인
- **검증**:
  - 전화번호 형식: `01012345678` 또는 `010-1234-5678` (하이픈 자동 추가됨)
  - 주민번호 형식: `XXXXXXX` (앞6자리 + 뒤1자리)
  - 비밀번호 일치 확인
  - 전화번호/주민번호 중복 검사

#### 로그인
- **엔드포인트**: `POST /api/auth/login`
- **필수 정보**: 전화번호, 비밀번호
- **로그인 성공 시**: 세션에 사용자 정보 저장 (30분 유효)

#### 로그아웃
- **엔드포인트**: `POST /api/auth/logout`
- **기능**: 세션 무효화

#### 비밀번호 재설정
- **엔드포인트**: `POST /api/auth/reset-password`
- **필수 정보**: 전화번호, 주민번호(본인 확인용), 새 비밀번호, 비밀번호 확인
- **검증**: 전화번호 **AND** 주민번호로 본인 확인 (둘 다 필요)
- **참고**: 비밀번호는 BCrypt로 암호화되어 복호화 불가능 (찾기 불가, 재설정만 가능)

#### 현재 사용자 정보 조회
- **엔드포인트**: `GET /api/auth/me`
- **기능**: 로그인된 사용자 정보 반환

### 2. 채팅방 관리

#### 채팅방 목록 조회
- **엔드포인트**: `GET /api/chat-rooms`
- **기능**: 현재 사용자가 참여한 모든 채팅방 목록 조회
- **정렬**: 최근 메시지 시간 기준 내림차순

#### 채팅방 생성 (사용자가 roomId 지정)
- **엔드포인트**: `POST /api/chat-rooms`
- **필수 정보**: roomId (채팅방 이름), otherUserId (상대방 ID)
- **기능**: 사용자가 원하는 이름(roomId)으로 채팅방 생성
- **검증**: roomId 중복 불가, 같은 두 사용자 간 중복 채팅방 불가

#### 특정 사용자와 채팅방 조회
- **엔드포인트**: `GET /api/chat-rooms/with/{otherUserId}`
- **기능**: 특정 사용자와의 기존 채팅방 조회 (생성하지 않음)


### 3. 실시간 채팅 (WebSocket)

#### 연결
- **엔드포인트**: `ws://localhost:8080/ws`
- **프로토콜**: SockJS + STOMP

#### 메시지 전송
- **목적지**: `/app/chat.sendMessage.{roomId}`
- **구독**: `/topic/chat.{roomId}`

#### 메시지 형식
```json
{
  "roomId": "room-uuid",
  "sender": "발신자 이름",
  "receiver": "수신자 이름",
  "content": "메시지 내용"
}
```

### 4. 사용자 관리

#### 사용자 목록 조회
- **엔드포인트**: `GET /api/users`
- **기능**: 모든 사용자 목록 조회 (채팅 상대 선택용)

## 데이터베이스 스키마

### users 테이블
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    resident_number VARCHAR(10) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);
```

### chat_rooms 테이블
```sql
CREATE TABLE chat_rooms (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    room_id VARCHAR(100) UNIQUE NOT NULL,
    user1_id BIGINT NOT NULL,
    user2_id BIGINT NOT NULL,
    last_message VARCHAR(500),
    last_message_time DATETIME,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (user1_id) REFERENCES users(id),
    FOREIGN KEY (user2_id) REFERENCES users(id)
);
```

### chat_messages 테이블
```sql
CREATE TABLE chat_messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    chat_room_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    content VARCHAR(1000) NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (chat_room_id) REFERENCES chat_rooms(id),
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
);
```

## 설정 방법

### 1. MySQL 데이터베이스 생성
```sql
CREATE DATABASE zzaptalk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. application.yml 설정
`src/main/resources/application.yml` 파일에서 MySQL 비밀번호를 설정하세요:
```yaml
spring:
  datasource:
    password: YOUR_MYSQL_PASSWORD
```

### 3. 애플리케이션 실행
```bash
# Windows
.\gradlew bootRun

# Linux/Mac
./gradlew bootRun
```

### 4. 접속 확인
- **API 서버**: http://localhost:8080
- **WebSocket**: ws://localhost:8080/ws

## API 응답 형식

### 성공 응답
```json
{
  "success": true,
  "message": "성공 메시지",
  "data": { /* 응답 데이터 */ }
}
```

### 에러 응답
```json
{
  "success": false,
  "message": "에러 메시지",
  "data": null
}
```

## 보안

- **비밀번호 암호화**: BCrypt 해시 알고리즘 사용
- **세션 기반 인증**: Spring Session 사용
- **CSRF 보호**: 개발 환경에서는 비활성화 (운영 환경에서는 활성화 권장)
- **HTTP-Only 쿠키**: 세션 쿠키는 HTTP-Only로 설정

## 향후 추가 예정 기능

- [ ] 본인 인증 (네이버클라우드 연동)
- [ ] JWT 토큰 기반 인증 (선택사항)
- [ ] 채팅 메시지 DB 저장 및 이력 조회
- [ ] 읽음/안읽음 표시
- [ ] 파일 전송 기능
- [ ] 알림 기능

## 프로젝트 구조

```
src/main/java/com/zzaptalk/backend/
├── config/           # 설정 클래스
│   ├── SecurityConfig.java
│   ├── WebConfig.java
│   └── WebSocketConfig.java
├── controller/       # REST API 컨트롤러
│   ├── AuthController.java
│   ├── ChatController.java
│   ├── ChatRoomController.java
│   └── UserController.java
├── dto/             # 데이터 전송 객체
│   ├── ApiResponse.java
│   ├── ChatRoomResponse.java
│   ├── LoginRequest.java
│   ├── ResetPasswordRequest.java
│   ├── SignupRequest.java
│   └── UserResponse.java
├── entity/          # JPA 엔티티
│   ├── ChatMessageEntity.java
│   ├── ChatRoom.java
│   └── User.java
├── exception/       # 예외 처리
│   └── GlobalExceptionHandler.java
├── model/           # WebSocket 메시지 모델
│   └── ChatMessage.java
├── repository/      # JPA 리포지토리
│   ├── ChatMessageRepository.java
│   ├── ChatRoomRepository.java
│   └── UserRepository.java
├── service/         # 비즈니스 로직
│   ├── ChatRoomService.java
│   └── UserService.java
└── ZzaptalkBackendApplication.java
```

## 문제 해결

### 데이터베이스 연결 오류
- MySQL 서버가 실행 중인지 확인
- `application.yml`의 데이터베이스 설정 확인
- 데이터베이스가 생성되었는지 확인

### WebSocket 연결 실패
- CORS 설정 확인
- WebSocket 지원 브라우저 사용 확인

## 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.

