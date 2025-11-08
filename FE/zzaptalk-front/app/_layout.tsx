import { Stack } from "expo-router";
import { Helmet } from "react-helmet";

export default function RootLayout() {
  return (
    <>
      <Helmet>
        <link rel="stylesheet" href="/global-icons.css" />
        <link rel="icon" href="/favicon.png" />
      </Helmet>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="signup" />
      </Stack>
    </>
  );
}
