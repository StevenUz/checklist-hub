import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";
import type { ChecklistDetailsDto } from "@checklisthub/shared";

import * as api from "@/lib/api";
import { colors, styles } from "@/lib/styles";

export default function ChecklistDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} />}
    >
      {isLoading ? <ActivityIndicator /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {checklist ? (
        <>
          <Text style={styles.title}>{checklist.title}</Text>
          <Text style={styles.subtitle}>
            {checklist.progress.completedItems} / {checklist.progress.totalItems} complete
          </Text>
          <View style={{ height: 10, borderRadius: 999, backgroundColor: "#e2e8f0" }}>
            <View
              style={{
                height: 10,
                width: `${checklist.progress.percentage}%`,
                borderRadius: 999,
                backgroundColor: colors.accent,
              }}
            />
          </View>

          {checklist.sections.map((section) => (
            <View key={section.id} style={styles.card}>
              <Text style={styles.label}>{section.title}</Text>
              {section.items.map((item) => (
                <Pressable key={item.id} style={styles.row} onPress={() => toggleItem(item.id)}>
                  <Text style={[styles.subtitle, { flex: 1, color: item.isCompleted ? colors.muted : colors.text }]}>
                    {item.text}
                  </Text>
                  <Text style={styles.label}>{item.isCompleted ? "Done" : "Open"}</Text>
                </Pressable>
              ))}
            </View>
          ))}

          {targetSectionId ? (
            <View style={styles.card}>
              <Text style={styles.label}>Add custom item</Text>
              <TextInput
                placeholder="Item text"
                style={styles.input}
                value={newItemText}
                onChangeText={setNewItemText}
              />
              <Pressable style={styles.button} onPress={addItem}>
                <Text style={styles.buttonText}>Add item</Text>
              </Pressable>
            </View>
          ) : null}
        </>
      ) : null}
    </ScrollView>
  );
}
