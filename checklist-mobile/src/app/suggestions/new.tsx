import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput } from "react-native";
import type { SuggestionTypeDto } from "@checklisthub/shared";

import { useAuth } from "@/auth/AuthContext";
import * as api from "@/lib/api";
import { styles } from "@/lib/styles";

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
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>New Suggestion</Text>
      <Text style={styles.subtitle}>Send an improvement proposal to ChecklistHub admins.</Text>

      {suggestionTypes.map((option) => (
        <Pressable
          key={option.value}
          style={type === option.value ? styles.button : styles.outlineButton}
          onPress={() => setType(option.value)}
        >
          <Text style={type === option.value ? styles.buttonText : [styles.buttonText, styles.outlineButtonText]}>
            {option.label}
          </Text>
        </Pressable>
      ))}

      <TextInput placeholder="Title" style={styles.input} value={title} onChangeText={setTitle} />
      <TextInput
        multiline
        placeholder="Description"
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        keyboardType="number-pad"
        placeholder="Target template ID, required for edits/variants"
        style={styles.input}
        value={targetTemplateId}
        onChangeText={setTargetTemplateId}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={styles.button} disabled={isSubmitting} onPress={submit}>
        <Text style={styles.buttonText}>{isSubmitting ? "Submitting..." : "Submit suggestion"}</Text>
      </Pressable>
    </ScrollView>
  );
}
