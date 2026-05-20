import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";
import type { ChecklistDetailsDto } from "@checklisthub/shared";

import * as api from "@/lib/api";
import { ChecklistSection } from "./ChecklistSection";

export default function ChecklistDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const checklistId = Number(id);
  const [checklist, setChecklist] = useState<ChecklistDetailsDto | null>(null);
  const [newItemText, setNewItemText] = useState("");
  const [targetSectionId, setTargetSectionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!Number.isInteger(checklistId)) {
      return;
    }
    setError("");
    try {
      const response = await api.getChecklist(checklistId);
      setChecklist(response.data);
      setTargetSectionId(response.data.sections[0]?.id ?? null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load checklist.");
    } finally {
      setIsLoading(false);
    }
  }, [checklistId]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleItem(itemId: number) {
    try {
      await api.toggleChecklistItem(checklistId, itemId);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to toggle item.");
    }
  }

  async function addItem() {
    if (!targetSectionId || !newItemText.trim()) {
      return;
    }

    try {
      const response = await api.addChecklistItem(checklistId, {
        sectionId: targetSectionId,
        text: newItemText,
      });
      setChecklist(response.data);
      setNewItemText("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to add item.");
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-canvas"
      contentContainerClassName="gap-4 px-5 pb-10 pt-4"
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} />}
    >
      <Pressable
        className="self-start rounded-full border border-line bg-surface px-4 py-2"
        onPress={() => router.push("/checklists")}
      >
        <Text className="text-sm font-bold text-ink">Back to My Checklists</Text>
      </Pressable>

      {isLoading ? <ActivityIndicator color="#047857" /> : null}
      {error ? <Text className="text-sm font-semibold text-rose-700">{error}</Text> : null}
      {checklist ? (
        <>
          <View className="gap-4 rounded-lg border border-line bg-surface p-5">
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1">
                <Text className="text-3xl font-bold text-ink">{checklist.title}</Text>
                <Text className="mt-2 text-base leading-6 text-muted">
                  {checklist.progress.completedItems} / {checklist.progress.totalItems} items complete
                </Text>
              </View>
              <Text className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                {checklist.progress.percentage}%
              </Text>
            </View>
            <View className="h-3 overflow-hidden rounded-full bg-slate-200">
              <View
                className="h-3 rounded-full bg-brand-700"
                style={{ width: `${checklist.progress.percentage}%` }}
              />
            </View>
          </View>

          {checklist.sections.map((section) => (
            <ChecklistSection key={section.id} section={section} onToggleItem={toggleItem} />
          ))}

          {targetSectionId ? (
            <View className="gap-3 rounded-lg border border-line bg-surface p-4">
              <Text className="text-lg font-bold text-ink">Add custom item</Text>
              <TextInput
                placeholder="Item text"
                className="min-h-12 rounded-lg border border-line bg-white px-4 text-ink"
                placeholderTextColor="#94a3b8"
                value={newItemText}
                onChangeText={setNewItemText}
              />
              <Pressable className="min-h-12 items-center justify-center rounded-lg bg-brand-700 px-4" onPress={addItem}>
                <Text className="font-bold text-white">Add item</Text>
              </Pressable>
            </View>
          ) : null}
        </>
      ) : null}
    </ScrollView>
  );
}
