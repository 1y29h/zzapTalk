import { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import "./App.css";

function App() {
  const [stompClient, setStompClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [roomId] = useState("room1");
  const [nickname, setNickname] = useState(localStorage.getItem("nickname") || "");
  const [connectionStatus, setConnectionStatus] = useState("연결 중...");
  const chatBoxRef = useRef(null);

  useEffect(() => {
    // 닉네임 없으면 입력받기
    if (!nickname) {
      const name = prompt("닉네임을 입력하세요") || "익명";
      localStorage.setItem("nickname", name);
      setNickname(name);
    }

    // ✅ 환경 변수에서 백엔드 URL 가져오기 (없으면 localhost)
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
    console.log("🔗 백엔드 URL:", backendUrl);

    // ✅ WebSocket 연결
    const socket = new SockJS(`${backendUrl}/ws`);
    const client = Stomp.over(socket);

    // ✅ 연결 성공
    client.connect(
      {},
      () => {
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
        client.send(`/app/chat.sendMessage.${roomId}`, {}, JSON.stringify(enterMsg));
      },
      // ✅ 연결 실패
      (error) => {
        console.error("❌ WebSocket 연결 실패:", error);
        setConnectionStatus("연결 실패 🔴");
      }
    );

    // ✅ 컴포넌트 언마운트 시 연결 종료
    return () => {
      if (client && client.connected) {
        const leaveMsg = {
          roomId,
          sender: nickname,
          content: `${nickname}님이 퇴장했습니다.`,
          type: "LEAVE"
        };
        client.send(`/app/chat.sendMessage.${roomId}`, {}, JSON.stringify(leaveMsg));
        client.disconnect(() => console.log("🔌 연결 종료"));
      }
    };
  }, [roomId, nickname]);

  // ✅ 새 메시지가 오면 스크롤 아래로
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // ✅ 메시지 보내기
  const sendMessage = () => {
    console.log("📡 stompClient 상태:", stompClient);
    
    if (!stompClient || !stompClient.connected) {
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
    stompClient.send(`/app/chat.sendMessage.${roomId}`, {}, JSON.stringify(msg));
    setInput("");
  };

  // ✅ Enter 키로 전송
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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