import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import type { SuggestionTypeDto } from "@checklisthub/shared";

import { useAuth } from "@/auth/AuthContext";
import * as api from "@/lib/api";

const suggestionTypes: Array<{ value: SuggestionTypeDto; label: string }> = [
  { value: "new_activity", label: "New activity" },
  { value: "new_template", label: "New template" },
  { value: "template_edit", label: "Template edit" },
  { value: "template_variant", label: "Template variant" },
];

export default function NewSuggestionScreen() {
  const { user } = useAuth();
  const [type, setType] = useState<SuggestionTypeDto>("new_template");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetTemplateId, setTargetTemplateId] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    if (!user) {
      router.push("/auth");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await api.createSuggestion({
        type,
        title,
        description,
        targetTemplateId: targetTemplateId.trim() ? Number(targetTemplateId) : null,
      });
      router.replace("/");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to submit suggestion.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-canvas" contentContainerClassName="gap-4 px-5 pb-10 pt-4">
      <View className="rounded-lg border border-line bg-surface p-5">
        <Text className="text-3xl font-bold text-ink">New Suggestion</Text>
        <Text className="mt-2 text-base leading-6 text-muted">
          Send an improvement proposal to ChecklistHub admins.
        </Text>
      </View>

      {suggestionTypes.map((option) => (
        <Pressable
          key={option.value}
          className={
            type === option.value
              ? "min-h-12 items-center justify-center rounded-lg bg-brand-700 px-4"
              : "min-h-12 items-center justify-center rounded-lg border border-line bg-surface px-4"
          }
          onPress={() => setType(option.value)}
        >
          <Text className={type === option.value ? "font-bold text-white" : "font-bold text-ink"}>
            {option.label}
          </Text>
        </Pressable>
      ))}

      <TextInput
        placeholder="Title"
        className="min-h-12 rounded-lg border border-line bg-surface px-4 text-ink"
        placeholderTextColor="#94a3b8"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        multiline
        placeholder="Description"
        className="min-h-28 rounded-lg border border-line bg-surface px-4 py-3 text-ink"
        placeholderTextColor="#94a3b8"
        textAlignVertical="top"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        keyboardType="number-pad"
        placeholder="Target template ID, required for edits/variants"
        className="min-h-12 rounded-lg border border-line bg-surface px-4 text-ink"
        placeholderTextColor="#94a3b8"
        value={targetTemplateId}
        onChangeText={setTargetTemplateId}
      />
      {error ? <Text className="text-sm font-semibold text-rose-700">{error}</Text> : null}
      <Pressable className="min-h-12 items-center justify-center rounded-lg bg-brand-700 px-4" disabled={isSubmitting} onPress={submit}>
        <Text className="font-bold text-white">{isSubmitting ? "Submitting..." : "Submit suggestion"}</Text>
      </Pressable>
    </ScrollView>
  );
}
