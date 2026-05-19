"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import {
  addTemplateItem,
  addTemplateSection,
  convertSuggestionToTemplate,
  createActivity,
  createAdminTemplate,
  createCategory,
  deleteTemplateItem,
  deleteTemplateSection,
  updateAdminTemplateMeta,
  updateSuggestionStatus,
  updateTemplateItem,
  updateTemplateSection,
  updateUserRole,
} from "@/services/adminService";

export type AdminActionState = {
  error?: string;
};

const allowedTemplateStatuses = ["draft", "published", "archived"] as const;
const allowedSuggestionStatuses = ["accepted", "rejected"] as const;
const allowedUserRoles = ["user", "admin"] as const;
const allowedConvertModes = ["new_template", "update", "variant"] as const;

async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/dashboard");
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

function readOptionalString(formData: FormData, key: string) {
  const value = readString(formData, key).trim();
  return value ? value : null;
}

function readPositiveInt(formData: FormData, key: string) {
  const value = Number(readRequiredString(formData, key));

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Invalid ${key}`);
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

export async function createAdminTemplateAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const admin = await requireAdmin();
    const status = readRequiredString(formData, "status");

    if (!allowedTemplateStatuses.includes(status as (typeof allowedTemplateStatuses)[number])) {
      return { error: "Invalid status" };
    }

    const template = await createAdminTemplate({
      title: readRequiredString(formData, "title"),
      description: readRequiredString(formData, "description"),
      status: status as (typeof allowedTemplateStatuses)[number],
      categoryId: readPositiveInt(formData, "categoryId"),
      activityId: readOptionalPositiveInt(formData, "activityId"),
      adminUserId: admin.id,
    });

    revalidatePath("/admin/templates");
    redirect(`/admin/templates/${template.id}/edit`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create template.";
    return { error: message };
  }
}

export async function updateAdminTemplateMetaAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const admin = await requireAdmin();
    const status = readRequiredString(formData, "status");

    if (!allowedTemplateStatuses.includes(status as (typeof allowedTemplateStatuses)[number])) {
      return { error: "Invalid status" };
    }

    await updateAdminTemplateMeta({
      templateId: readPositiveInt(formData, "templateId"),
      title: readRequiredString(formData, "title"),
      description: readRequiredString(formData, "description"),
      status: status as (typeof allowedTemplateStatuses)[number],
      categoryId: readPositiveInt(formData, "categoryId"),
      activityId: readOptionalPositiveInt(formData, "activityId"),
      adminUserId: admin.id,
    });

    revalidatePath(`/admin/templates/${readRequiredString(formData, "templateId")}/edit`);
    return {};
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update template.";
    return { error: message };
  }
}

export async function addTemplateSectionAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const templateId = readPositiveInt(formData, "templateId");

    await addTemplateSection({
      templateId,
      title: readRequiredString(formData, "title"),
      description: readOptionalString(formData, "description"),
    });

    revalidatePath(`/admin/templates/${templateId}/edit`);
    return {};
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to add section.";
    return { error: message };
  }
}

export async function updateTemplateSectionAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const templateId = readPositiveInt(formData, "templateId");

    await updateTemplateSection({
      sectionId: readPositiveInt(formData, "sectionId"),
      title: readRequiredString(formData, "title"),
      description: readOptionalString(formData, "description"),
    });

    revalidatePath(`/admin/templates/${templateId}/edit`);
    return {};
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update section.";
    return { error: message };
  }
}

export async function deleteTemplateSectionAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const templateId = readPositiveInt(formData, "templateId");
    const sectionId = readPositiveInt(formData, "sectionId");

    await deleteTemplateSection(sectionId);
    revalidatePath(`/admin/templates/${templateId}/edit`);
    return {};
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete section.";
    return { error: message };
  }
}

export async function addTemplateItemAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const templateId = readPositiveInt(formData, "templateId");

    await addTemplateItem({
      sectionId: readPositiveInt(formData, "sectionId"),
      text: readRequiredString(formData, "text"),
      description: readOptionalString(formData, "description"),
      isRequired: readString(formData, "isRequired") === "on",
    });

    revalidatePath(`/admin/templates/${templateId}/edit`);
    return {};
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to add item.";
    return { error: message };
  }
}

export async function updateTemplateItemAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const templateId = readPositiveInt(formData, "templateId");

    await updateTemplateItem({
      itemId: readPositiveInt(formData, "itemId"),
      text: readRequiredString(formData, "text"),
      description: readOptionalString(formData, "description"),
      isRequired: readString(formData, "isRequired") === "on",
    });

    revalidatePath(`/admin/templates/${templateId}/edit`);
    return {};
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update item.";
    return { error: message };
  }
}

export async function deleteTemplateItemAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const templateId = readPositiveInt(formData, "templateId");
    const itemId = readPositiveInt(formData, "itemId");

    await deleteTemplateItem(itemId);
    revalidatePath(`/admin/templates/${templateId}/edit`);
    return {};
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete item.";
    return { error: message };
  }
}

export async function updateSuggestionStatusAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const admin = await requireAdmin();
    const status = readRequiredString(formData, "status");

    if (!allowedSuggestionStatuses.includes(status as (typeof allowedSuggestionStatuses)[number])) {
      return { error: "Invalid status" };
    }

    await updateSuggestionStatus({
      suggestionId: readPositiveInt(formData, "suggestionId"),
      status: status as (typeof allowedSuggestionStatuses)[number],
      adminNotes: readOptionalString(formData, "adminNotes"),
      reviewedByUserId: admin.id,
    });

    revalidatePath("/admin/suggestions");
    return {};
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update suggestion.";
    return { error: message };
  }
}

export async function convertSuggestionAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const admin = await requireAdmin();
    const mode = readRequiredString(formData, "mode");

    if (!allowedConvertModes.includes(mode as (typeof allowedConvertModes)[number])) {
      return { error: "Invalid conversion mode" };
    }

    const template = await convertSuggestionToTemplate({
      suggestionId: readPositiveInt(formData, "suggestionId"),
      adminUserId: admin.id,
      mode: mode as (typeof allowedConvertModes)[number],
      categoryId: readOptionalPositiveInt(formData, "categoryId"),
      activityId: readOptionalPositiveInt(formData, "activityId"),
      adminNotes: readOptionalString(formData, "adminNotes"),
    });

    revalidatePath("/admin/suggestions");
    revalidatePath("/admin/templates");
    redirect(`/admin/templates/${template.id}/edit`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to convert suggestion.";
    return { error: message };
  }
}

export async function createCategoryAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();

    await createCategory({
      name: readRequiredString(formData, "name"),
      slug: readOptionalString(formData, "slug"),
      description: readOptionalString(formData, "description"),
    });

    revalidatePath("/admin/categories");
    return {};
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create category.";
    return { error: message };
  }
}

export async function createActivityAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();

    await createActivity({
      categoryId: readPositiveInt(formData, "categoryId"),
      name: readRequiredString(formData, "name"),
      slug: readOptionalString(formData, "slug"),
      description: readOptionalString(formData, "description"),
    });

    revalidatePath("/admin/categories");
    return {};
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create activity.";
    return { error: message };
  }
}

export async function updateUserRoleAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const admin = await requireAdmin();
    const role = readRequiredString(formData, "role");

    if (!allowedUserRoles.includes(role as (typeof allowedUserRoles)[number])) {
      return { error: "Invalid role" };
    }

    await updateUserRole({
      userId: readPositiveInt(formData, "userId"),
      role: role as (typeof allowedUserRoles)[number],
      adminUserId: admin.id,
    });

    revalidatePath("/admin/users");
    return {};
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update user role.";
    return { error: message };
  }
}
