import { Link, router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import type { ChecklistListItemDto } from "@checklisthub/shared";

import { useAuth } from "@/auth/AuthContext";
import * as api from "@/lib/api";
import { colors, styles } from "@/lib/styles";

export default function ChecklistsScreen() {
  const { user } = useAuth();
  const [checklists, setChecklists] = useState<ChecklistListItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setError("");
    try {
      const response = await api.listChecklists();
      setChecklists(response.data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load checklists.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  if (!user) {
    return (
      <View style={[styles.screen, styles.content]}>
        <Text style={styles.title}>My Checklists</Text>
        <Text style={styles.subtitle}>Login to view your personal checklists.</Text>
        <Pressable style={styles.button} onPress={() => router.push("/auth")}>
          <Text style={styles.buttonText}>Login</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} />}
    >
      <Text style={styles.title}>My Checklists</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {isLoading ? <ActivityIndicator /> : null}
      {checklists.map((checklist) => (
        <Link key={checklist.id} href={`/checklists/${checklist.id}` as never} asChild>
          <Pressable style={styles.card}>
            <Text style={styles.label}>{checklist.title}</Text>
            <Text style={styles.subtitle}>
              {checklist.progress.completedItems} / {checklist.progress.totalItems} complete
            </Text>
            <View style={{ height: 8, borderRadius: 999, backgroundColor: "#e2e8f0" }}>
              <View
                style={{
                  height: 8,
                  width: `${checklist.progress.percentage}%`,
                  borderRadius: 999,
                  backgroundColor: colors.accent,
                }}
              />
            </View>
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}
