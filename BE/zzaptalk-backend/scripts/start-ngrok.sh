#!/bin/bash
# zzaptalk-backend/scripts/start-ngrok.sh
# 백엔드 ngrok 실행 + .env 자동 생성 + Git 자동 push

BACKEND_PORT=8080
FRONT_PATH="../../FE/zzaptalk-frontend"

echo "🚀 백엔드 ngrok 실행 중..."
pkill -f "ngrok http $BACKEND_PORT" 2>/dev/null
ngrok http $BACKEND_PORT > /tmp/ngrok.log &

sleep 5

BACKEND_NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels \
  | grep -o "https://[a-z0-9-]*\.ngrok-free\.dev" | head -n 1)

if [ -z "$BACKEND_NGROK_URL" ]; then
  echo "❌ ngrok URL을 가져오지 못했습니다."
  exit 1
fi

echo "✅ 백엔드 ngrok URL: $BACKEND_NGROK_URL"

# ✅ 프론트 .env 업데이트
echo "VITE_BACKEND_URL=$BACKEND_NGROK_URL" > "$FRONT_PATH/.env"
echo "✅ .env 생성 완료!"
cat "$FRONT_PATH/.env"

# ✅ 자동 커밋 & 푸시
cd ../../FE/zzaptalk-frontend/.env
git add .env
git commit -m "🔄 자동 갱신된 백엔드 URL: $BACKEND_NGROK_URL"
git push origin main

echo "✅ .env 자동 push 완료!"
echo "💡 민서는 git pull만 하면 자동 최신 백엔드 연결됨."