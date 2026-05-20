import { Link, router } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/auth/AuthContext";
import { CHECKLISTHUB_API_URL } from "@/lib/config";
import { styles } from "@/lib/styles";

export default function HomeScreen() {
  const { user, isLoading, signOut } = useAuth();

  if (isLoading) {
    return (
      <View style={[styles.screen, styles.content]}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View>
        <Text style={styles.title}>ChecklistHub</Text>
        <Text style={styles.subtitle}>Browse templates, run checklists, and submit improvements.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>API</Text>
        <Text style={styles.subtitle}>{CHECKLISTHUB_API_URL}</Text>
      </View>

      {user ? (
        <View style={styles.card}>
          <Text style={styles.label}>Signed in as {user.name}</Text>
          <Text style={styles.subtitle}>{user.email}</Text>
          <Pressable style={styles.outlineButton} onPress={signOut}>
            <Text style={[styles.buttonText, styles.outlineButtonText]}>Sign out</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.button} onPress={() => router.push("/auth")}>
          <Text style={styles.buttonText}>Login / Register</Text>
        </Pressable>
      )}

      <Link href={"/templates" as never} asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Templates</Text>
        </Pressable>
      </Link>
      <Link href={"/checklists" as never} asChild>
        <Pressable style={StyleSheet.flatten([styles.button, styles.secondaryButton])}>
          <Text style={styles.buttonText}>My Checklists</Text>
        </Pressable>
      </Link>
      <Link href="/suggestions/new" asChild>
        <Pressable style={styles.outlineButton}>
          <Text style={[styles.buttonText, styles.outlineButtonText]}>New Suggestion</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}
