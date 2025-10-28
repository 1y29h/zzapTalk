import { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import "./App.css";

// ⚠️ 닉네임 설정 로직을 useEffect 밖으로 분리하여 무한 렌더링을 방지합니다.
const initialNickname = localStorage.getItem("nickname");

function App() {
  const [stompClient, setStompClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [roomId] = useState("room1");
  // 닉네임 상태는 이제 초기값을 외부에서 가져옵니다.
  const [nickname] = useState(initialNickname); 
  const [connectionStatus, setConnectionStatus] = useState("연결 중...");
  const chatBoxRef = useRef(null);

  useEffect(() => {
    if (!localStorage.getItem("nickname")) {
      const name = prompt("닉네임을 입력하세요") || "익명";
      localStorage.setItem("nickname", name);
      window.location.reload();
    }
    // 🔗 환경 변수에서 백엔드 URL 가져오기
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
    console.log("🔗 백엔드 URL:", backendUrl);

    // 1. Client 객체 생성 (옵션 기반 설정)
    const client = new Client({
      // 2. SockJS를 WebSocket Factory로 사용하도록 설정
      webSocketFactory: () => {
        return new SockJS(`${backendUrl}/ws`);
      },
      
      // 3. 연결 성공 시 (onConnect)
      onConnect: () => {
        console.log("✅ WebSocket 연결 성공");
        setConnectionStatus("연결됨 🟢");
        setStompClient(client);

        // 서버에서 오는 메시지 수신
        client.subscribe(`/topic/chat.${roomId}`, (msg) => {
          const message = JSON.parse(msg.body);
          console.log("📨 수신:", message);
          setMessages((prev) => [...prev, message]);
        });

        // 입장 메시지 전송
        const enterMsg = {
          roomId,
          sender: nickname,
          content: `${nickname}님이 입장했습니다.`,
          type: "ENTER"
        };
        // 4. 전송은 client.publish() 사용
        client.publish({ destination: `/app/chat.sendMessage.${roomId}`, body: JSON.stringify(enterMsg) });
      },
      
      // 5. 연결 오류 발생 시 (onStompError)
      onStompError: (frame) => {
        console.error("❌ STOMP 오류:", frame);
        setConnectionStatus("연결 오류 🔴");
      },
      onWebSocketClose: () => {
        console.log("❌ WebSocket 연결 종료 (비정상)");
      },
      
      // 6. 연결을 바로 시작
      reconnectDelay: 5000, 
      debug: (str) => console.log(new Date(), str),
    });

    // 7. 클라이언트 활성화 (연결 시도 시작)
    client.activate();


    // 8. ✅ 컴포넌트 언마운트 시 연결 종료
    return () => {
      if (client && client.active) { // client.connected 대신 client.active 사용
        
        // 퇴장 메시지는 연결이 활성화(active)된 상태에서만 시도
        const leaveMsg = {
          roomId,
          sender: nickname,
          content: `${nickname}님이 퇴장했습니다.`,
          type: "LEAVE"
        };
        // 9. 퇴장 메시지 전송 및 연결 비활성화
        client.publish({ destination: `/app/chat.sendMessage.${roomId}`, body: JSON.stringify(leaveMsg) });
        client.deactivate(() => console.log("🔌 연결 종료"));
      }
    };
  }, [roomId]); // 닉네임은 이제 의존성 배열에서 제외 (변경되지 않으므로)

  // ✅ 새 메시지가 오면 스크롤 아래로
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // ✅ 메시지 보내기
  const sendMessage = () => {
    console.log("📡 stompClient 상태:", stompClient);
    
    if (!stompClient || !stompClient.active) { // client.connected 대신 client.active 사용
      console.warn("⚠️ 연결 안됨: 메시지 전송 불가");
      alert("서버와 연결되지 않았습니다. 페이지를 새로고침해주세요.");
      return;
    }
    
    if (input.trim() === "") return;

    // iPhone 대응: 키보드 포커스 제거
    const inputEl = document.querySelector(".chat-input");
    if (inputEl) inputEl.blur();

    const msg = {
      roomId,
      sender: nickname,
      content: input.trim(),
      type: "TALK"
    };

    console.log("📤 전송:", msg);
    // 10. 전송은 stompClient.publish() 사용
    stompClient.publish({ destination: `/app/chat.sendMessage.${roomId}`, body: JSON.stringify(msg) });
    setInput("");
  };

  // ✅ Enter 키로 전송
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 닉네임이 설정되지 않았다면 (reload 대기 중) 아무것도 렌더링하지 않습니다.
  if (!nickname) return null;


  return (
    <div style={{ padding: 40, fontFamily: "sans-serif", maxWidth: 600, margin: "0 auto" }}>
      <h2>💬 Zzaptalk</h2>
      <p>
        👤 {nickname} | 🏠 {roomId} | {connectionStatus}
      </p>

      <div className="chat-box" ref={chatBoxRef}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#999", padding: 20 }}>
            메시지가 없습니다. 첫 메시지를 보내보세요!
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              textAlign: msg.sender === nickname ? "right" : "left",
              margin: "8px 0",
            }}
          >
            {msg.type === "ENTER" || msg.type === "LEAVE" ? (
              <div style={{ textAlign: "center", color: "#888", fontSize: 14 }}>
                {msg.content}
              </div>
            ) : (
              <div className={`message ${msg.sender === nickname ? "me" : "other"}`}>
                <b>{msg.sender}</b>
                <div>{msg.content}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="chat-input-container">
        <input
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="메시지를 입력하세요"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="send-btn"
        >
          전송
        </button>
      </div>
    </div>
  );
}

export default App;