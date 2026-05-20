import { Link } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import type { TemplateListItemDto } from "@checklisthub/shared";

import * as api from "@/lib/api";

export default function TemplatesScreen() {
  const [templates, setTemplates] = useState<TemplateListItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const response = await api.listTemplates();
      setTemplates(response.data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load templates.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScrollView
      className="flex-1 bg-canvas"
      contentContainerClassName="gap-4 px-5 pb-10 pt-4"
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} />}
    >
      <View className="rounded-lg border border-line bg-surface p-5">
        <Text className="text-3xl font-bold text-ink">Templates</Text>
        <Text className="mt-2 text-base leading-6 text-muted">
          Official checklists curated for repeatable real-world workflows.
        </Text>
      </View>
      {error ? <Text className="text-sm font-semibold text-rose-700">{error}</Text> : null}
      {isLoading ? <ActivityIndicator color="#047857" /> : null}
      {templates.map((template) => (
        <Link key={template.id} href={`/templates/${template.id}` as never} asChild>
          <Pressable className="gap-3 rounded-lg border border-line bg-surface p-4 active:bg-slate-50">
            <View className="flex-row items-start justify-between gap-3">
              <Text className="flex-1 text-lg font-bold text-ink">{template.title}</Text>
              <Text className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                v{template.versionNumber}
              </Text>
            </View>
            <Text className="text-sm leading-5 text-muted">{template.description}</Text>
            <View className="flex-row flex-wrap gap-2">
              <Text className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-muted">
                {template.category.name}
              </Text>
              {template.activity ? (
                <Text className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-muted">
                  {template.activity.name}
                </Text>
              ) : null}
            </View>
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}
