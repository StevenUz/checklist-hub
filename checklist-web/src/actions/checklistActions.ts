"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import {
  addChecklistItem,
  addChecklistSection,
  createChecklistFromTemplate,
  deleteChecklistItem,
  deleteChecklistSection,
  toggleChecklistItem,
  updateChecklistItem,
  updateChecklistSection,
} from "@/services/checklistService";

export async function startChecklistAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const templateId = Number(formData.get("templateId"));

  if (!Number.isInteger(templateId) || templateId <= 0) {
    throw new Error("Invalid template id");
  }

  const checklist = await createChecklistFromTemplate({
    templateId,
    userId: user.id,
  });

  redirect(`/checklists/${checklist.id}`);
}

async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

function readPositiveInt(formData: FormData, key: string) {
  const value = Number(formData.get(key));

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Invalid ${key}`);
  }

  return value;
}

function readRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  const text = typeof value === "string" ? value.trim() : "";

  if (!text) {
    throw new Error(`${key} is required`);
  }

  return text;
}

function refreshChecklist(checklistId: number) {
  revalidatePath("/dashboard");
  revalidatePath("/checklists");
  revalidatePath(`/checklists/${checklistId}`);
}

export async function toggleChecklistItemAction(formData: FormData) {
  const user = await requireUser();
  const checklistId = await toggleChecklistItem({
    userId: user.id,
    itemId: readPositiveInt(formData, "itemId"),
  });

  refreshChecklist(checklistId);
}

export async function addChecklistSectionAction(formData: FormData) {
  const user = await requireUser();
  const checklistId = await addChecklistSection({
    userId: user.id,
    checklistId: readPositiveInt(formData, "checklistId"),
    title: readRequiredString(formData, "title"),
  });

  refreshChecklist(checklistId);
}

export async function updateChecklistSectionAction(formData: FormData) {
  const user = await requireUser();
  const checklistId = await updateChecklistSection({
    userId: user.id,
    sectionId: readPositiveInt(formData, "sectionId"),
    title: readRequiredString(formData, "title"),
  });

  refreshChecklist(checklistId);
}

export async function deleteChecklistSectionAction(formData: FormData) {
  const user = await requireUser();
  const checklistId = await deleteChecklistSection({
    userId: user.id,
    sectionId: readPositiveInt(formData, "sectionId"),
  });

  refreshChecklist(checklistId);
}

export async function addChecklistItemAction(formData: FormData) {
  const user = await requireUser();
  const checklistId = await addChecklistItem({
    userId: user.id,
    sectionId: readPositiveInt(formData, "sectionId"),
    text: readRequiredString(formData, "text"),
  });

  refreshChecklist(checklistId);
}

export async function updateChecklistItemAction(formData: FormData) {
  const user = await requireUser();
  const checklistId = await updateChecklistItem({
    userId: user.id,
    itemId: readPositiveInt(formData, "itemId"),
    text: readRequiredString(formData, "text"),
  });

  refreshChecklist(checklistId);
}

export async function deleteChecklistItemAction(formData: FormData) {
  const user = await requireUser();
  const checklistId = await deleteChecklistItem({
    userId: user.id,
    itemId: readPositiveInt(formData, "itemId"),
  });

  refreshChecklist(checklistId);
}
