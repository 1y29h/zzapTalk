import { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import "./App.css";

function App() {
  const [stompClient, setStompClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [roomId] = useState("room1");
  const [nickname, setNickname] = useState(localStorage.getItem("nickname") || "");

  useEffect(() => {
    // 닉네임 없으면 입력받기
    if (!nickname) {
      const name = prompt("닉네임을 입력하세요");
      localStorage.setItem("nickname", name);
      setNickname(name);
    }

    // 백엔드 연결
    const socket = new SockJS(`${import.meta.env.VITE_BACKEND_URL}/ws`, null, {
      withCredentials: false,
    });
    const client = Stomp.over(socket);

    client.connect({}, () => {
      console.log("✅ WebSocket 연결 성공");
      setStompClient(client);

      // 서버에서 오는 메시지 수신
      client.subscribe(`/topic/chat.${roomId}`, (msg) => {
        const message = JSON.parse(msg.body);
        setMessages((prev) => [...prev, message]);
      });
    });

    return () => {
      if (client && client.connected) {
        client.disconnect(() => console.log("🔌 연결 종료"));
      }
    };
  }, [roomId]);

  // ✅ 메시지 보내기 (iPhone 대응)
  const sendMessage = () => {
    console.log("📡 stompClient 상태:", stompClient); // ✅ 추가
    if (!stompClient || !stompClient.connected) {
      console.warn("⚠️ 연결 안됨: 메시지 전송 불가");
      return;
    }
    if (input.trim() === "") return;

    // iPhone 대응: 키보드 포커스 제거
    const inputEl = document.querySelector("input");
    if (inputEl) inputEl.blur();

    const msg = {
      roomId,
      sender: nickname,
      content: input,
    };

    stompClient.send(`/app/chat.sendMessage.${roomId}`, {}, JSON.stringify(msg));
    setInput("");
  };

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h2>💬 Zzaptalk</h2>
      <p>👤 {nickname} | 🏠 {roomId}</p>

      <div className="chat-box">
  {messages.map((msg, i) => (
    <div
      key={i}
      style={{
        textAlign: msg.sender === nickname ? "right" : "left",
        margin: "4px 0",
      }}
    >
      <div className={`message ${msg.sender === nickname ? "me" : "other"}`}>
        <b>{msg.sender}</b>
        <div>{msg.content}</div>
      </div>
    </div>
  ))}
</div>

<div className="chat-input-container">
  <input
    className="chat-input"
    value={input}
    onChange={(e) => setInput(e.target.value)}
    placeholder="메시지를 입력하세요"
  />
  <button
    type="button"
    onClick={sendMessage}
    onTouchStart={sendMessage}
    className="send-btn"
  >
    전송
  </button>
</div>

    </div>
  );
}

export default App;