import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { useAuth } from "@/auth/AuthContext";
import { styles } from "@/lib/styles";

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
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{mode === "login" ? "Welcome back" : "Create account"}</Text>
      {mode === "register" ? (
        <TextInput
          autoCapitalize="words"
          placeholder="Name"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
      ) : null}
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={styles.button} disabled={isSubmitting} onPress={submit}>
        <Text style={styles.buttonText}>{isSubmitting ? "Please wait..." : mode === "login" ? "Login" : "Register"}</Text>
      </Pressable>
      <Pressable
        style={styles.outlineButton}
        onPress={() => setMode(mode === "login" ? "register" : "login")}
      >
        <Text style={[styles.buttonText, styles.outlineButtonText]}>
          {mode === "login" ? "Need an account?" : "Already have an account?"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
