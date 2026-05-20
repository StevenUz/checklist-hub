import { Link, router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import type { ChecklistListItemDto } from "@checklisthub/shared";

import { useAuth } from "@/auth/AuthContext";
import * as api from "@/lib/api";

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
      <View className="flex-1 gap-4 bg-canvas px-5 pt-4">
        <Text className="text-3xl font-bold text-ink">My Checklists</Text>
        <Text className="text-base leading-6 text-muted">Login to view your personal checklists.</Text>
        <Pressable className="min-h-12 items-center justify-center rounded-lg bg-brand-700 px-4" onPress={() => router.push("/auth")}>
          <Text className="font-bold text-white">Login</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-canvas"
      contentContainerClassName="gap-4 px-5 pb-10 pt-4"
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} />}
    >
      <View className="rounded-lg border border-line bg-surface p-5">
        <Text className="text-3xl font-bold text-ink">My Checklists</Text>
        <Text className="mt-2 text-base leading-6 text-muted">
          Continue active lists and track progress as you complete each item.
        </Text>
      </View>
      {error ? <Text className="text-sm font-semibold text-rose-700">{error}</Text> : null}
      {isLoading ? <ActivityIndicator color="#047857" /> : null}
      {checklists.map((checklist) => (
        <Link key={checklist.id} href={`/checklists/${checklist.id}` as never} asChild>
          <Pressable className="gap-3 rounded-lg border border-line bg-surface p-4 active:bg-slate-50">
            <View className="flex-row items-start justify-between gap-3">
              <Text className="flex-1 text-lg font-bold text-ink">{checklist.title}</Text>
              <Text className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                {checklist.progress.percentage}%
              </Text>
            </View>
            <Text className="text-sm text-muted">
              {checklist.progress.completedItems} / {checklist.progress.totalItems} complete
            </Text>
            <View className="h-2 overflow-hidden rounded-full bg-slate-200">
              <View
                className="h-2 rounded-full bg-brand-700"
                style={{ width: `${checklist.progress.percentage}%` }}
              />
            </View>
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}
