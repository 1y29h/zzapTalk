#!/bin/bash
# zzapTalk/BE/zzaptalk-backend/scripts/start-ngrok.sh
# 백엔드 ngrok 실행 + React .env 자동 업데이트 + 프론트 자동 실행

PORT=8080
FRONT_PATH="../../FE/zzaptalk-frontend"

echo "🚀 백엔드 ngrok 실행 중..."
# 기존 ngrok 프로세스 종료
pkill -f "ngrok http $PORT" 2>/dev/null

# ngrok 실행
ngrok http $PORT > /tmp/ngrok.log &

# ngrok 실행될 때까지 대기
sleep 5

# ngrok API에서 URL 가져오기
NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels | grep -o "https://[a-z0-9-]*\.ngrok-free\.dev" | head -n 1)

if [ -z "$NGROK_URL" ]; then
  echo "❌ ngrok URL을 가져오지 못했습니다. (4040 포트 확인 필요)"
  exit 1
fi

echo "✅ 백엔드 ngrok URL: $NGROK_URL"

# 프론트 .env 갱신
echo "VITE_BACKEND_URL=$NGROK_URL" > "$FRONT_PATH/.env"
echo "🔄 프론트엔드 .env 갱신 완료!"
cat "$FRONT_PATH/.env"

# 프론트 ngrok 실행을 위해 프론트 서버 먼저 띄우기
echo "🚀 프론트엔드 Vite 실행 중..."
cd "$FRONT_PATH"
npm run dev &

# Vite 서버가 뜰 때까지 대기 (3~5초)
sleep 5

# Vite 포트 확인 (기본 5173)
FRONT_PORT=5173

# 프론트 ngrok 실행
echo "🌐 프론트 ngrok 실행 중..."
pkill -f "ngrok http $FRONT_PORT" 2>/dev/null
ngrok http $FRONT_PORT > /tmp/ngrok-frontend.log &

sleep 5

FRONT_NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels | grep -o "https://[a-z0-9-]*\.ngrok-free\.dev" | tail -n 1)

if [ -z "$FRONT_NGROK_URL" ]; then
  echo "❌ 프론트 ngrok URL을 가져오지 못했습니다."
  exit 1
fi

echo "✅ 프론트 ngrok URL: $FRONT_NGROK_URL"
echo "✅ Safari에서 이 주소로 접속하세요 👉 $FRONT_NGROK_URL"