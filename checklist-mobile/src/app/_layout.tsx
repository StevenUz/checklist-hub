import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import "@/global.css";
import { AuthProvider } from "@/auth/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: "#f8fafc" },
          headerStyle: { backgroundColor: "#f8fafc" },
          headerShadowVisible: false,
          headerTintColor: "#0f172a",
          headerTitleStyle: { fontWeight: "700" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "ChecklistHub" }} />
        <Stack.Screen name="auth" options={{ title: "Login / Register" }} />
        <Stack.Screen name="templates/index" options={{ title: "Templates" }} />
        <Stack.Screen name="templates/[id]" options={{ title: "Template" }} />
        <Stack.Screen name="checklists/index" options={{ title: "My Checklists" }} />
        <Stack.Screen name="checklists/[id]" options={{ title: "Checklist" }} />
        <Stack.Screen name="suggestions/new" options={{ title: "New Suggestion" }} />
      </Stack>
    </AuthProvider>
  );
}
