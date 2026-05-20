import { Link, router } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import { useAuth } from "@/auth/AuthContext";

export default function HomeScreen() {
  const { user, isLoading, signOut } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator color="#047857" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-canvas" contentContainerClassName="gap-4 px-5 pb-10 pt-4">
      <View className="rounded-lg border border-line bg-surface p-5">
        <Text className="text-3xl font-bold text-ink">ChecklistHub</Text>
        <Text className="mt-2 text-base leading-6 text-muted">
          Browse official templates, run personal checklists, and submit useful improvements.
        </Text>
      </View>

      {user ? (
        <View className="gap-3 rounded-lg border border-line bg-surface p-4">
          <View>
            <Text className="text-base font-bold text-ink">Signed in as {user.name}</Text>
            <Text className="text-sm text-muted">{user.email}</Text>
          </View>
          <Pressable className="min-h-11 items-center justify-center rounded-lg border border-line bg-white px-4" onPress={signOut}>
            <Text className="font-bold text-ink">Sign out</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable className="min-h-12 items-center justify-center rounded-lg bg-brand-700 px-4" onPress={() => router.push("/auth")}>
          <Text className="font-bold text-white">Login / Register</Text>
        </Pressable>
      )}

      <Link href={"/templates" as never} asChild>
        <Pressable className="min-h-12 items-center justify-center rounded-lg bg-ink px-4">
          <Text className="font-bold text-white">Templates</Text>
        </Pressable>
      </Link>
      <Link href={"/checklists" as never} asChild>
        <Pressable className="min-h-12 items-center justify-center rounded-lg bg-brand-700 px-4">
          <Text className="font-bold text-white">My Checklists</Text>
        </Pressable>
      </Link>
      <Link href="/suggestions/new" asChild>
        <Pressable className="min-h-12 items-center justify-center rounded-lg border border-line bg-surface px-4">
          <Text className="font-bold text-ink">New Suggestion</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}
