import { Stack } from "expo-router";
import { Helmet } from "react-helmet"; // ✅ 추가 설치 필요

export default function RootLayout() {
  return (
    <>
      {/* Helmet으로 head 영역 수정 */}
      <Helmet>
        {/* expo-vector-icons 웹용 폰트 경로 추가 */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/@expo/vector-icons@13.0.0/build/vendor/react-native-vector-icons/Fonts/Ionicons.css"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/@expo/vector-icons@13.0.0/build/vendor/react-native-vector-icons/Fonts/Feather.css"
        />
        <link rel="icon" href="/favicon.png" />
      </Helmet>

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="signup" />
      </Stack>
    </>
  );
}
