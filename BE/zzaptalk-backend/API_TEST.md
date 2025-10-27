# API 테스트 가이드

## 1. 회원가입 테스트

```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "홍길동",
    "phoneNumber": "01012345678",
    "residentNumber": "9901011",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

**참고**: 전화번호는 `01012345678` 또는 `010-1234-5678` 형식 모두 가능 (자동으로 하이픈 추가됨)

**예상 응답:**
```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다.",
  "data": {
    "id": 1,
    "name": "홍길동",
    "phoneNumber": "010-1234-5678"
  }
}
```

## 2. 로그인 테스트

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "phoneNumber": "01012345678",
    "password": "password123"
  }'
```

**주의**: `-c cookies.txt` 옵션으로 세션 쿠키를 저장합니다.

**예상 응답:**
```json
{
  "success": true,
  "message": "로그인에 성공했습니다.",
  "data": {
    "id": 1,
    "name": "홍길동",
    "phoneNumber": "010-1234-5678"
  }
}
```

## 3. 현재 사용자 정보 조회

```bash
curl -X GET http://localhost:8080/api/auth/me \
  -b cookies.txt
```

**주의**: `-b cookies.txt` 옵션으로 저장된 세션 쿠키를 사용합니다.

## 4. 사용자 목록 조회

```bash
curl -X GET http://localhost:8080/api/users
```

**예상 응답:**
```json
{
  "success": true,
  "message": "성공",
  "data": [
    {
      "id": 1,
      "name": "홍길동",
      "phoneNumber": "010-1234-5678"
    },
    {
      "id": 2,
      "name": "김철수",
      "phoneNumber": "010-9876-5432"
    }
  ]
}
```

## 5. 채팅방 목록 조회

```bash
curl -X GET http://localhost:8080/api/chat-rooms \
  -b cookies.txt
```

## 6. 채팅방 생성 (사용자가 roomId 지정)

```bash
# 사용자가 원하는 이름으로 채팅방 생성
curl -X POST http://localhost:8080/api/chat-rooms \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "roomId": "daily-chat",
    "otherUserId": 2
  }'
```

**예상 응답:**
```json
{
  "success": true,
  "message": "채팅방이 생성되었습니다.",
  "data": {
    "id": 1,
    "roomId": "daily-chat",
    "otherUser": {
      "id": 2,
      "name": "김철수",
      "phoneNumber": "010-9876-5432"
    },
    "lastMessage": null,
    "lastMessageTime": null,
    "createdAt": "2025-10-27T10:30:00"
  }
}
```

## 6-1. 특정 사용자와의 채팅방 조회

```bash
# 사용자 ID 2와의 기존 채팅방 조회
curl -X GET http://localhost:8080/api/chat-rooms/with/2 \
  -b cookies.txt
```

## 7. 비밀번호 재설정

```bash
curl -X POST http://localhost:8080/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "01012345678",
    "residentNumber": "9901011",
    "newPassword": "newpassword123",
    "confirmPassword": "newpassword123"
  }'
```

## 8. 로그아웃

```bash
curl -X POST http://localhost:8080/api/auth/logout \
  -b cookies.txt
```

## WebSocket 테스트

### JavaScript로 WebSocket 연결 테스트

```javascript
// SockJS 및 STOMP 라이브러리 필요
const socket = new SockJS('http://localhost:8080/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({}, function(frame) {
    console.log('Connected: ' + frame);
    
    // 채팅방 구독 (사용자가 지정한 roomId 사용)
    stompClient.subscribe('/topic/chat.daily-chat', function(message) {
        const chatMessage = JSON.parse(message.body);
        console.log('Received:', chatMessage);
    });
    
    // 메시지 전송
    stompClient.send("/app/chat.sendMessage.daily-chat", {}, JSON.stringify({
        roomId: 'daily-chat',  // 사용자가 지정한 채팅방 이름
        sender: '홍길동',
        receiver: '김철수',
        content: '안녕하세요!'
    }));
});
```

## Postman을 사용한 테스트

1. **회원가입**: POST `http://localhost:8080/api/auth/signup`
2. **로그인**: POST `http://localhost:8080/api/auth/login`
   - 로그인 후 자동으로 쿠키가 저장됩니다
3. **나머지 API**: 로그인 후 자동으로 세션 쿠키가 포함됩니다

## 테스트 시나리오

### 전체 흐름 테스트

1. **사용자 1 회원가입** (홍길동)
2. **사용자 2 회원가입** (김철수)
3. **사용자 1 로그인**
4. **사용자 목록 조회** (김철수 찾기)
5. **채팅방 생성** (원하는 이름으로, 예: "daily-chat")
6. **WebSocket 연결** 및 채팅 시작
7. **채팅방 목록 조회** (마지막 메시지 확인)
8. **로그아웃**

## 주의사항

- 모든 인증이 필요한 API는 로그인 후 세션 쿠키를 포함해야 합니다
- **전화번호**: `01012345678` 또는 `010-1234-5678` 형식 모두 가능 (자동으로 하이픈 추가됨)
- 주민번호는 앞6자리 + 뒤1자리 (총 7자리) 형식으로 입력
- 비밀번호와 비밀번호 확인은 반드시 일치해야 합니다
- **비밀번호 재설정**: 전화번호 + 주민번호 둘 다 필요 (본인 확인)
- **roomId**: 사용자가 직접 설정 (채팅방 이름), 중복 불가
- **보안**: 채팅방은 채팅목록에서만 확인 가능 (roomId로 직접 조회 불가)

