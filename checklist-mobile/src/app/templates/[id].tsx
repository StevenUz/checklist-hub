import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import type { TemplateDetailsDto } from "@checklisthub/shared";

import { useAuth } from "@/auth/AuthContext";
import * as api from "@/lib/api";
import { styles } from "@/lib/styles";

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
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {isLoading ? <ActivityIndicator /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {template ? (
        <>
          <Text style={styles.title}>{template.title}</Text>
          <Text style={styles.subtitle}>{template.description}</Text>
          <Pressable style={styles.button} onPress={startChecklist}>
            <Text style={styles.buttonText}>Start checklist</Text>
          </Pressable>
          {template.sections.map((section) => (
            <View key={section.id} style={styles.card}>
              <Text style={styles.label}>{section.title}</Text>
              {section.items.map((item) => (
                <Text key={item.id} style={styles.subtitle}>
                  {item.isRequired ? "* " : "- "}
                  {item.text}
                </Text>
              ))}
            </View>
          ))}
        </>
      ) : null}
    </ScrollView>
  );
}
