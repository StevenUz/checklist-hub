"use server";

import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { createChecklistFromTemplate } from "@/services/checklistService";

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
