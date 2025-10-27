# API 사용 가이드

## 📋 주요 변경사항

### 1. 비밀번호 재설정
- **전화번호 + 주민번호** 둘 다 필요 (본인 확인)
- 비밀번호는 BCrypt로 암호화되어 복호화 불가능 (찾기 불가능, 재설정만 가능)

### 2. roomId (채팅방 이름)
- **사용자가 직접 설정** 가능
- 채팅방 생성 시 원하는 이름으로 지정
- 중복된 이름은 사용 불가
- ⚠️ **roomId로 직접 조회 불가** - 채팅목록에서만 확인 가능

### 3. 채팅방 목록 조회
- 사용자가 자신이 참여한 채팅방 목록을 확인하는 기능
- 관리자용이 아닌 일반 사용자 기능
- **보안**: 사용자는 자신이 속한 채팅방만 볼 수 있음

### 4. 전화번호 하이픈 자동 처리
- 입력: `01012345678` 또는 `010-1234-5678`
- 저장: `010-1234-5678` (자동 포맷팅)
- 하이픈 없이 입력해도 자동으로 추가됨

---

## 🔐 인증 API

### 1. 회원가입
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "홍길동",
  "phoneNumber": "01012345678",     // 하이픈 없이 입력해도 자동으로 010-1234-5678로 저장됨
  "residentNumber": "9901011",
  "password": "password123",
  "confirmPassword": "password123"
}
```

### 2. 로그인
```http
POST /api/auth/login
Content-Type: application/json

{
  "phoneNumber": "01012345678",    // 하이픈 없이도 가능 (자동 변환)
  "password": "password123"
}
```

### 3. 비밀번호 재설정 ⚠️
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "phoneNumber": "01012345678",       // 하이픈 없이도 가능 (자동 변환)
  "residentNumber": "9901011",        // ✅ 본인 확인용 (필수)
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```
**주의**: 전화번호 + 주민번호 둘 다 입력해야 본인 확인 가능

### 4. 로그아웃
```http
POST /api/auth/logout
```

---

## 💬 채팅방 API

### 1. 내 채팅방 목록 조회
```http
GET /api/chat-rooms
```
**설명**: 로그인한 사용자가 참여한 모든 채팅방 목록

**응답 예시**:
```json
{
  "success": true,
  "message": "성공",
  "data": [
    {
      "id": 1,
      "roomId": "daily-chat",
      "otherUser": {
        "id": 2,
        "name": "김철수",
        "phoneNumber": "010-9876-5432"
      },
      "lastMessage": "안녕하세요!",
      "lastMessageTime": "2025-10-27T15:30:00",
      "createdAt": "2025-10-27T10:00:00"
    }
  ]
}
```

### 2. 채팅방 생성 (사용자가 roomId 지정) ⭐
```http
POST /api/chat-rooms
Content-Type: application/json

{
  "roomId": "daily-chat",      // ✅ 사용자가 원하는 채팅방 이름
  "otherUserId": 2             // 채팅 상대방의 ID
}
```

**검증**:
- `roomId`가 이미 존재하면 에러
- 두 사용자 간에 이미 채팅방이 있으면 에러

### 3. 특정 사용자와의 채팅방 조회
```http
GET /api/chat-rooms/with/{otherUserId}
```
**설명**: 특정 사용자와의 기존 채팅방 조회 (생성하지 않음)

---

## 👥 사용자 API

### 사용자 목록 조회
```http
GET /api/users
```
**설명**: 채팅 상대를 선택하기 위한 전체 사용자 목록

---

## 🔌 WebSocket (실시간 채팅)

### 연결
```javascript
const socket = new SockJS('http://localhost:8080/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({}, function(frame) {
    // 채팅방 구독 (사용자가 지정한 roomId 사용)
    stompClient.subscribe('/topic/chat.daily-chat', function(message) {
        const chatMessage = JSON.parse(message.body);
        console.log(chatMessage);
    });
});
```

### 메시지 전송
```javascript
stompClient.send("/app/chat.sendMessage.daily-chat", {}, JSON.stringify({
    roomId: 'daily-chat',    // 사용자가 지정한 채팅방 이름
    sender: '홍길동',
    receiver: '김철수',
    content: '안녕하세요!'
}));
```

---

## 📝 사용 시나리오

### 시나리오 1: 새로운 채팅방 만들기

1. **로그인**
```bash
POST /api/auth/login
{
  "phoneNumber": "010-1234-5678",
  "password": "password123"
}
```

2. **사용자 목록 조회** (채팅 상대 찾기)
```bash
GET /api/users
```

3. **채팅방 생성** (원하는 이름으로)
```bash
POST /api/chat-rooms
{
  "roomId": "weekend-chat",  // 원하는 채팅방 이름
  "otherUserId": 2
}
```

4. **WebSocket 연결 및 채팅**
```javascript
stompClient.subscribe('/topic/chat.weekend-chat', ...);
stompClient.send("/app/chat.sendMessage.weekend-chat", ...);
```

### 시나리오 2: 비밀번호 재설정

```bash
POST /api/auth/reset-password
{
  "phoneNumber": "010-1234-5678",
  "residentNumber": "9901011",       // ✅ 본인 확인 필수
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

### 시나리오 3: 내 채팅방 목록 확인

```bash
GET /api/chat-rooms
```

---

## ⚠️ 주의사항

### 1. 비밀번호
- BCrypt 암호화로 저장
- 복호화 불가능 → **찾기 불가능**, 재설정만 가능
- 재설정 시 **전화번호 + 주민번호** 둘 다 필요

### 2. roomId (채팅방 이름)
- **사용자가 직접 설정**
- 한글, 영문, 숫자 등 자유롭게 사용 가능
- **중복 불가** (고유해야 함)
- **⚠️ roomId로 직접 조회 불가** - 채팅목록에서만 확인 가능
- 예시: "일상톡", "daily-chat", "room-123" 등

### 3. 전화번호
- 입력: `01012345678` 또는 `010-1234-5678` 모두 가능
- 저장: `010-1234-5678` (자동으로 하이픈 추가됨)
- 하이픈 없이 입력해도 자동 변환

### 3. 채팅방 생성
- 같은 두 사용자 간에는 **한 개의 채팅방만** 생성 가능
- 이미 채팅방이 있으면 에러 발생

### 4. 세션
- 로그인 후 세션 쿠키 자동 저장
- 30분 타임아웃
- 인증이 필요한 API는 로그인 후 사용 가능

---

## 🔍 에러 메시지

| 에러 메시지 | 의미 |
|-----------|------|
| "이미 존재하는 채팅방 이름입니다." | roomId 중복 |
| "이미 해당 사용자와의 채팅방이 존재합니다." | 동일한 두 사용자 간 채팅방 중복 |
| "본인 확인에 실패했습니다." | 비밀번호 재설정 시 주민번호 불일치 |
| "전화번호 또는 비밀번호가 올바르지 않습니다." | 로그인 실패 |
| "이미 등록된 전화번호입니다." | 회원가입 시 중복 |
| "로그인이 필요합니다." | 세션 만료 또는 미로그인 |

---

## 🎯 요약

✅ **비밀번호 재설정**: 전화번호 + 주민번호 (둘 다 필요)  
✅ **roomId**: 사용자가 직접 설정 (채팅방 이름)  
✅ **채팅방 조회**: 채팅목록에서만 가능 (roomId로 직접 조회 불가)  
✅ **전화번호**: 하이픈 자동 추가 (01012345678 → 010-1234-5678)  
✅ **비밀번호 암호화**: BCrypt (복호화 불가능)

