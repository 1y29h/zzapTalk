// 바꿔야 하는 부분
// import LoginScreen from "../src/screens/LoginScreen";
import LoginScreen from "./screens/LoginScreen"; // ✅ app/index.tsx 기준 상대경로
export default function Index() {
  return <LoginScreen />;
}
