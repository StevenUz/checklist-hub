import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { useAuth } from "@/auth/AuthContext";

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    setError("");
    setIsSubmitting(true);
    try {
      if (mode === "login") {
        await signIn({ email, password });
      } else {
        await signUp({ name, email, password });
      }
      router.replace("/");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-canvas" contentContainerClassName="gap-4 px-5 pb-10 pt-4">
      <View className="rounded-lg border border-line bg-surface p-5">
        <Text className="text-3xl font-bold text-ink">
          {mode === "login" ? "Welcome back" : "Create account"}
        </Text>
        <Text className="mt-2 text-base leading-6 text-muted">
          {mode === "login"
            ? "Sign in to sync checklists and submit suggestions."
            : "Create an account to start using templates on mobile."}
        </Text>
      </View>
      {mode === "register" ? (
        <TextInput
          autoCapitalize="words"
          placeholder="Name"
          className="min-h-12 rounded-lg border border-line bg-surface px-4 text-ink"
          placeholderTextColor="#94a3b8"
          value={name}
          onChangeText={setName}
        />
      ) : null}
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        className="min-h-12 rounded-lg border border-line bg-surface px-4 text-ink"
        placeholderTextColor="#94a3b8"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        className="min-h-12 rounded-lg border border-line bg-surface px-4 text-ink"
        placeholderTextColor="#94a3b8"
        value={password}
        onChangeText={setPassword}
      />
      {error ? <Text className="text-sm font-semibold text-rose-700">{error}</Text> : null}
      <Pressable className="min-h-12 items-center justify-center rounded-lg bg-brand-700 px-4" disabled={isSubmitting} onPress={submit}>
        <Text className="font-bold text-white">
          {isSubmitting ? "Please wait..." : mode === "login" ? "Login" : "Register"}
        </Text>
      </Pressable>
      <Pressable
        className="min-h-12 items-center justify-center rounded-lg border border-line bg-surface px-4"
        onPress={() => setMode(mode === "login" ? "register" : "login")}
      >
        <Text className="font-bold text-ink">
          {mode === "login" ? "Need an account?" : "Already have an account?"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
