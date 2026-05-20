import { and, asc, count, desc, eq, max } from "drizzle-orm";

import { db } from "@/db";
import {
  checklistTemplates,
  templateItems,
  templateSections,
  userChecklistItems,
  userChecklists,
  userChecklistSections,
} from "@/db/schema";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

type PagingParams = {
  page?: number;
  pageSize?: number;
};

function normalizePaging(params: PagingParams = {}) {
  const page = Number.isFinite(params.page) && params.page && params.page > 0 ? params.page : 1;
  const requestedPageSize =
    Number.isFinite(params.pageSize) && params.pageSize && params.pageSize > 0
      ? params.pageSize
      : DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(requestedPageSize, MAX_PAGE_SIZE);

  return {
    page,
    pageSize,
    offset: (page - 1) * pageSize,
  };
}

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

export function getChecklistProgress(
  sections: Array<{ items: Array<{ isCompleted: boolean }> }>,
) {
  const totalItems = sections.reduce((total, section) => total + section.items.length, 0);
  const completedItems = sections.reduce(
    (total, section) => total + section.items.filter((item) => item.isCompleted).length,
    0,
  );

  return {
    totalItems,
    completedItems,
    percentage: totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100),
  };
}

export async function listUserChecklists(
  userId: number,
  params: PagingParams = {},
) {
  const { page, pageSize, offset } = normalizePaging(params);

  const checklists = await db.query.userChecklists.findMany({
    where: eq(userChecklists.userId, userId),
    orderBy: [desc(userChecklists.updatedAt), desc(userChecklists.id)],
    limit: pageSize,
    offset,
    with: {
      sections: {
        with: {
          items: true,
        },
      },
      template: {
        with: {
          category: true,
        },
      },
    },
  });

  const [{ total }] = await db
    .select({ total: count() })
    .from(userChecklists)
    .where(eq(userChecklists.userId, userId));

  return {
    data: checklists.map((checklist) => ({
    ...checklist,
    progress: getChecklistProgress(checklist.sections),
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

export async function getUserChecklistDetails(input: { checklistId: number; userId: number }) {
  const checklist = await db.query.userChecklists.findFirst({
    where: and(eq(userChecklists.id, input.checklistId), eq(userChecklists.userId, input.userId)),
    with: {
      sections: {
        orderBy: [asc(userChecklistSections.sortOrder), asc(userChecklistSections.id)],
        with: {
          items: {
            orderBy: [asc(userChecklistItems.sortOrder), asc(userChecklistItems.id)],
          },
        },
      },
      template: {
        with: {
          category: true,
        },
      },
    },
  });

  if (!checklist) {
    return null;
  }

  return {
    ...checklist,
    progress: getChecklistProgress(checklist.sections),
  };
}

async function getOwnedSection(input: { sectionId: number; userId: number }) {
  const section = await db
    .select({
      id: userChecklistSections.id,
      userChecklistId: userChecklistSections.userChecklistId,
    })
    .from(userChecklistSections)
    .innerJoin(userChecklists, eq(userChecklistSections.userChecklistId, userChecklists.id))
    .where(and(eq(userChecklistSections.id, input.sectionId), eq(userChecklists.userId, input.userId)))
    .limit(1);

  return section[0] ?? null;
}

async function getOwnedItem(input: { itemId: number; userId: number }) {
  const item = await db
    .select({
      id: userChecklistItems.id,
      userChecklistSectionId: userChecklistItems.userChecklistSectionId,
      userChecklistId: userChecklistSections.userChecklistId,
      isCompleted: userChecklistItems.isCompleted,
    })
    .from(userChecklistItems)
    .innerJoin(
      userChecklistSections,
      eq(userChecklistItems.userChecklistSectionId, userChecklistSections.id),
    )
    .innerJoin(userChecklists, eq(userChecklistSections.userChecklistId, userChecklists.id))
    .where(and(eq(userChecklistItems.id, input.itemId), eq(userChecklists.userId, input.userId)))
    .limit(1);

  return item[0] ?? null;
}

export async function toggleChecklistItem(input: { itemId: number; userId: number }) {
  const item = await getOwnedItem(input);

  if (!item) {
    throw new Error("Checklist item not found");
  }

  const nextCompleted = !item.isCompleted;

  await db
    .update(userChecklistItems)
    .set({
      isCompleted: nextCompleted,
      completedAt: nextCompleted ? new Date() : null,
    })
    .where(eq(userChecklistItems.id, item.id));

  return item.userChecklistId;
}

export async function addChecklistSection(input: {
  checklistId: number;
  userId: number;
  title: string;
}) {
  const checklist = await db.query.userChecklists.findFirst({
    where: and(eq(userChecklists.id, input.checklistId), eq(userChecklists.userId, input.userId)),
  });

  if (!checklist) {
    throw new Error("Checklist not found");
  }

  const [{ sortOrder }] = await db
    .select({ sortOrder: max(userChecklistSections.sortOrder) })
    .from(userChecklistSections)
    .where(eq(userChecklistSections.userChecklistId, input.checklistId));

  await db.insert(userChecklistSections).values({
    userChecklistId: input.checklistId,
    title: input.title.trim(),
    sortOrder: (sortOrder ?? -1) + 1,
  });

  return input.checklistId;
}

export async function updateChecklistSection(input: {
  sectionId: number;
  userId: number;
  title: string;
}) {
  const section = await getOwnedSection(input);

  if (!section) {
    throw new Error("Checklist section not found");
  }

  await db
    .update(userChecklistSections)
    .set({ title: input.title.trim() })
    .where(eq(userChecklistSections.id, input.sectionId));

  return section.userChecklistId;
}

export async function deleteChecklistSection(input: { sectionId: number; userId: number }) {
  const section = await getOwnedSection(input);

  if (!section) {
    throw new Error("Checklist section not found");
  }

  await db.delete(userChecklistSections).where(eq(userChecklistSections.id, input.sectionId));
  return section.userChecklistId;
}

export async function addChecklistItem(input: {
  sectionId: number;
  userId: number;
  text: string;
}) {
  const section = await getOwnedSection(input);

  if (!section) {
    throw new Error("Checklist section not found");
  }

  const [{ sortOrder }] = await db
    .select({ sortOrder: max(userChecklistItems.sortOrder) })
    .from(userChecklistItems)
    .where(eq(userChecklistItems.userChecklistSectionId, input.sectionId));

  await db.insert(userChecklistItems).values({
    userChecklistSectionId: input.sectionId,
    text: input.text.trim(),
    sortOrder: (sortOrder ?? -1) + 1,
  });

  return section.userChecklistId;
}

export async function updateChecklistItem(input: { itemId: number; userId: number; text: string }) {
  const item = await getOwnedItem(input);

  if (!item) {
    throw new Error("Checklist item not found");
  }

  await db
    .update(userChecklistItems)
    .set({ text: input.text.trim() })
    .where(eq(userChecklistItems.id, input.itemId));

  return item.userChecklistId;
}

export async function deleteChecklistItem(input: { itemId: number; userId: number }) {
  const item = await getOwnedItem(input);

  if (!item) {
    throw new Error("Checklist item not found");
  }

  await db.delete(userChecklistItems).where(eq(userChecklistItems.id, input.itemId));
  return item.userChecklistId;
}
