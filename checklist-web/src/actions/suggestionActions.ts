"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import {
  addSuggestionComment,
  createSuggestion,
  type SuggestionType,
} from "@/services/suggestionService";

export type SuggestionFormState = {
  error?: string;
};

export type SuggestionCommentState = {
  error?: string;
};

const allowedTypes: SuggestionType[] = [
  "new_activity",
  "new_template",
  "template_edit",
  "template_variant",
];

async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function readRequiredString(formData: FormData, key: string) {
  const value = readString(formData, key).trim();

  if (!value) {
    throw new Error(`${key} is required`);
  }

  return value;
}

function readOptionalPositiveInt(formData: FormData, key: string) {
  const raw = readString(formData, key).trim();

  if (!raw) {
    return null;
  }

  const value = Number(raw);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Invalid ${key}`);
  }

  return value;
}

function readPositiveInt(formData: FormData, key: string) {
  const value = Number(readRequiredString(formData, key));

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Invalid ${key}`);
  }

  return value;
}

export async function submitSuggestionAction(
  _previousState: SuggestionFormState,
  formData: FormData,
): Promise<SuggestionFormState> {
  try {
    const user = await requireUser();
    const type = readRequiredString(formData, "type");

    if (!allowedTypes.includes(type as SuggestionType)) {
      return { error: "Select a valid suggestion type." };
    }

    await createSuggestion({
      userId: user.id,
      type: type as SuggestionType,
      title: readRequiredString(formData, "title"),
      description: readRequiredString(formData, "description"),
      targetTemplateId: readOptionalPositiveInt(formData, "targetTemplateId"),
    });

    revalidatePath("/suggestions");
    redirect("/suggestions");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit suggestion.";
    return { error: message };
  }
}

export async function addSuggestionCommentAction(
  _previousState: SuggestionCommentState,
  formData: FormData,
): Promise<SuggestionCommentState> {
  try {
    const user = await requireUser();

    await addSuggestionComment({
      userId: user.id,
      suggestionId: readPositiveInt(formData, "suggestionId"),
      text: readRequiredString(formData, "text"),
    });

    revalidatePath("/suggestions");
    return {};
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to add comment.";
    return { error: message };
  }
}
