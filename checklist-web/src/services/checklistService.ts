import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  checklistTemplates,
  templateItems,
  templateSections,
  userChecklistItems,
  userChecklists,
  userChecklistSections,
} from "@/db/schema";

export async function createChecklistFromTemplate(input: { templateId: number; userId: number }) {
  const template = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.id, input.templateId),
    with: {
      sections: {
        orderBy: [asc(templateSections.sortOrder), asc(templateSections.id)],
        with: {
          items: {
            orderBy: [asc(templateItems.sortOrder), asc(templateItems.id)],
          },
        },
      },
    },
  });

  if (!template || template.status !== "published") {
    throw new Error("Template not found");
  }

  const [createdChecklist] = await db
    .insert(userChecklists)
    .values({
      userId: input.userId,
      templateId: template.id,
      title: template.title,
      description: template.description,
      status: "active",
    })
    .returning();

  for (const section of template.sections) {
    const [createdSection] = await db
      .insert(userChecklistSections)
      .values({
        userChecklistId: createdChecklist.id,
        sourceTemplateSectionId: section.id,
        title: section.title,
        description: section.description,
        sortOrder: section.sortOrder,
      })
      .returning();

    if (section.items.length > 0) {
      await db.insert(userChecklistItems).values(
        section.items.map((item) => ({
          userChecklistSectionId: createdSection.id,
          sourceTemplateItemId: item.id,
          text: item.text,
          description: item.description,
          isRequired: item.isRequired,
          sortOrder: item.sortOrder,
        })),
      );
    }
  }

  return createdChecklist;
}
