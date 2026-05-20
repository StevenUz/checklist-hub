import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AuthProvider } from "@/auth/AuthContext";
import { colors } from "@/lib/styles";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.background },
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerTintColor: colors.text,
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
