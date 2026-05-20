import { Link } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import type { TemplateListItemDto } from "@checklisthub/shared";

import * as api from "@/lib/api";
import { styles } from "@/lib/styles";

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
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} />}
    >
      <Text style={styles.title}>Templates</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {isLoading ? <ActivityIndicator /> : null}
      {templates.map((template) => (
        <Link key={template.id} href={`/templates/${template.id}` as never} asChild>
          <Pressable style={styles.card}>
            <Text style={styles.label}>{template.title}</Text>
            <Text style={styles.subtitle}>{template.description}</Text>
            <View style={styles.row}>
              <Text style={styles.muted}>{template.category.name}</Text>
              <Text style={styles.muted}>v{template.versionNumber}</Text>
            </View>
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}
