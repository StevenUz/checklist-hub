import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import type { TemplateDetailsDto } from "@checklisthub/shared";

import { useAuth } from "@/auth/AuthContext";
import * as api from "@/lib/api";

export default function TemplateDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const templateId = Number(id);
  const [template, setTemplate] = useState<TemplateDetailsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!Number.isInteger(templateId)) {
      return;
    }
    setError("");
    try {
      const response = await api.getTemplate(templateId);
      setTemplate(response.data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load template.");
    } finally {
      setIsLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    load();
  }, [load]);

  async function startChecklist() {
    if (!user) {
      router.push("/auth");
      return;
    }

    setError("");
    try {
      const response = await api.createChecklist({ templateId });
      router.push(`/checklists/${response.data.id}` as never);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to start checklist.");
    }
  }

  return (
    <ScrollView className="flex-1 bg-canvas" contentContainerClassName="gap-4 px-5 pb-10 pt-4">
      {isLoading ? <ActivityIndicator color="#047857" /> : null}
      {error ? <Text className="text-sm font-semibold text-rose-700">{error}</Text> : null}
      {template ? (
        <>
          <View className="rounded-lg border border-line bg-surface p-5">
            <Text className="text-3xl font-bold text-ink">{template.title}</Text>
            <Text className="mt-2 text-base leading-6 text-muted">{template.description}</Text>
            <View className="mt-4 flex-row flex-wrap gap-2">
              <Text className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                {template.category.name}
              </Text>
              <Text className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                {template.sections.length} sections
              </Text>
            </View>
          </View>
          <Pressable className="min-h-12 items-center justify-center rounded-lg bg-brand-700 px-4" onPress={startChecklist}>
            <Text className="font-bold text-white">Start checklist</Text>
          </Pressable>
          {template.sections.map((section) => (
            <View key={section.id} className="gap-3 rounded-lg border border-line bg-surface p-4">
              <Text className="text-lg font-bold text-ink">{section.title}</Text>
              {section.items.map((item) => (
                <View key={item.id} className="flex-row gap-3 border-t border-slate-100 pt-3">
                  <Text className="mt-0.5 text-brand-700">{item.isRequired ? "*" : "-"}</Text>
                  <Text className="flex-1 text-sm leading-5 text-slate-700">{item.text}</Text>
                </View>
              ))}
            </View>
          ))}
        </>
      ) : null}
    </ScrollView>
  );
}
