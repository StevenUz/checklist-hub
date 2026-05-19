import {
  and,
  asc,
  count,
  countDistinct,
  desc,
  eq,
  ilike,
  max,
  or,
} from "drizzle-orm";

import { db } from "@/db";
import {
  activities,
  categories,
  checklistTemplates,
  suggestionComments,
  suggestions,
  templateItems,
  templateSections,
  users,
} from "@/db/schema";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

export type AdminTemplateListParams = {
  page?: number;
  pageSize?: number;
  query?: string;
  status?: typeof checklistTemplates.$inferSelect["status"] | "";
  category?: string;
};

export type AdminSuggestionListParams = {
  page?: number;
  pageSize?: number;
  status?: typeof suggestions.$inferSelect["status"] | "";
};

export type AdminUserListParams = {
  page?: number;
  pageSize?: number;
};

export type AdminCategoryListParams = {
  page?: number;
  pageSize?: number;
};

export type AdminActivityListParams = {
  page?: number;
  pageSize?: number;
};

function normalizePaging(params: { page?: number; pageSize?: number }) {
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

function normalizeText(value: string, fieldName: string, maxLength = 2000) {
  const text = value.trim();

  if (!text) {
    throw new Error(`${fieldName} is required`);
  }

  if (text.length > maxLength) {
    throw new Error(`${fieldName} must be ${maxLength} characters or fewer`);
  }

  return text;
}

function slugify(value: string) {
  const base = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return base || "template";
}

async function buildUniqueTemplateSlug(title: string) {
  const base = slugify(title);
  let slug = base;
  let index = 1;

  while (true) {
    const existing = await db.query.checklistTemplates.findFirst({
      where: eq(checklistTemplates.slug, slug),
      columns: { id: true },
    });

    if (!existing) {
      return slug;
    }

    slug = `${base}-${index}`;
    index += 1;
  }
}

export async function getAdminDashboardStats() {
  const [{ totalTemplates }] = await db
    .select({ totalTemplates: count() })
    .from(checklistTemplates);
  const [{ publishedTemplates }] = await db
    .select({ publishedTemplates: count() })
    .from(checklistTemplates)
    .where(eq(checklistTemplates.status, "published"));
  const [{ totalUsers }] = await db.select({ totalUsers: count() }).from(users);
  const [{ pendingSuggestions }] = await db
    .select({ pendingSuggestions: count() })
    .from(suggestions)
    .where(eq(suggestions.status, "pending"));

  return {
    totalTemplates,
    publishedTemplates,
    totalUsers,
    pendingSuggestions,
  };
}

export async function listAdminTemplates(params: AdminTemplateListParams = {}) {
  const { page, pageSize, offset } = normalizePaging(params);
  const filters = [] as Array<ReturnType<typeof eq> | ReturnType<typeof ilike> | ReturnType<typeof or>>;

  const query = params.query?.trim();
  const status = params.status?.trim();
  const category = params.category?.trim();

  if (query) {
    filters.push(
      or(
        ilike(checklistTemplates.title, `%${query}%`),
        ilike(checklistTemplates.description, `%${query}%`),
      )!,
    );
  }

  if (status) {
    filters.push(eq(checklistTemplates.status, status as typeof checklistTemplates.$inferSelect["status"]));
  }

  if (category) {
    filters.push(eq(categories.slug, category));
  }

  const where = filters.length ? and(...filters) : undefined;

  const rows = await db
    .select({
      id: checklistTemplates.id,
      title: checklistTemplates.title,
      description: checklistTemplates.description,
      status: checklistTemplates.status,
      versionNumber: checklistTemplates.versionNumber,
      updatedAt: checklistTemplates.updatedAt,
      category: {
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      },
      activity: {
        id: activities.id,
        name: activities.name,
        slug: activities.slug,
      },
    })
    .from(checklistTemplates)
    .innerJoin(categories, eq(checklistTemplates.categoryId, categories.id))
    .leftJoin(activities, eq(checklistTemplates.activityId, activities.id))
    .where(where)
    .orderBy(desc(checklistTemplates.updatedAt), asc(checklistTemplates.title))
    .limit(pageSize)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(checklistTemplates)
    .innerJoin(categories, eq(checklistTemplates.categoryId, categories.id))
    .leftJoin(activities, eq(checklistTemplates.activityId, activities.id))
    .where(where);

  return {
    data: rows,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

export async function getAdminTemplateDetails(templateId: number) {
  const template = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.id, templateId),
    with: {
      category: true,
      activity: true,
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

  return template ?? null;
}

export async function listAdminSuggestions(params: AdminSuggestionListParams = {}) {
  const { page, pageSize, offset } = normalizePaging(params);
  const status = params.status?.trim();

  const where = status ? eq(suggestions.status, status as typeof suggestions.$inferSelect["status"]) : undefined;

  const rows = await db.query.suggestions.findMany({
    where,
    orderBy: [desc(suggestions.createdAt), desc(suggestions.id)],
    limit: pageSize,
    offset,
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      targetTemplate: {
        columns: {
          id: true,
          title: true,
        },
      },
      comments: {
        orderBy: [asc(suggestionComments.createdAt), asc(suggestionComments.id)],
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  const [{ total }] = await db
    .select({ total: count() })
    .from(suggestions)
    .where(where);

  return {
    data: rows,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

export async function updateSuggestionStatus(input: {
  suggestionId: number;
  status: typeof suggestions.$inferSelect["status"];
  adminNotes?: string | null;
  reviewedByUserId: number;
}) {
  const [updated] = await db
    .update(suggestions)
    .set({
      status: input.status,
      adminNotes: input.adminNotes?.trim() || null,
      reviewedByUserId: input.reviewedByUserId,
      reviewedAt: new Date(),
    })
    .where(eq(suggestions.id, input.suggestionId))
    .returning();

  if (!updated) {
    throw new Error("Suggestion not found");
  }

  return updated;
}

export async function convertSuggestionToTemplate(input: {
  suggestionId: number;
  adminUserId: number;
  mode: "new_template" | "update" | "variant";
  categoryId?: number | null;
  activityId?: number | null;
  adminNotes?: string | null;
}) {
  const suggestion = await db.query.suggestions.findFirst({
    where: eq(suggestions.id, input.suggestionId),
    with: {
      targetTemplate: true,
    },
  });

  if (!suggestion) {
    throw new Error("Suggestion not found");
  }

  let categoryId = suggestion.targetTemplate?.categoryId ?? null;
  let activityId = suggestion.targetTemplate?.activityId ?? null;
  let parentTemplateId: number | null = null;
  let versionNumber = 1;

  if (input.mode === "new_template") {
    if (!input.categoryId) {
      throw new Error("Category is required for new templates");
    }

    categoryId = input.categoryId;
    activityId = input.activityId ?? null;
  } else {
    if (!suggestion.targetTemplate) {
      throw new Error("Target template is required for this conversion");
    }

    parentTemplateId = suggestion.targetTemplate.id;
    if (input.mode === "update") {
      versionNumber = suggestion.targetTemplate.versionNumber + 1;
    }
  }

  if (!categoryId) {
    throw new Error("Category is required for this template");
  }

  const slug = await buildUniqueTemplateSlug(suggestion.title);

  const [createdTemplate] = await db
    .insert(checklistTemplates)
    .values({
      categoryId,
      activityId,
      title: suggestion.title,
      description: suggestion.description,
      slug,
      status: "draft",
      versionNumber,
      parentTemplateId,
      createdByUserId: input.adminUserId,
      updatedByUserId: input.adminUserId,
    })
    .returning();

  await db
    .update(suggestions)
    .set({
      status: "implemented",
      reviewedByUserId: input.adminUserId,
      reviewedAt: new Date(),
      adminNotes: input.adminNotes?.trim() || null,
      targetTemplateId: createdTemplate.id,
    })
    .where(eq(suggestions.id, suggestion.id));

  return createdTemplate;
}

export async function createAdminTemplate(input: {
  title: string;
  description: string;
  status: typeof checklistTemplates.$inferSelect["status"];
  categoryId: number;
  activityId?: number | null;
  adminUserId: number;
}) {
  const title = normalizeText(input.title, "Title", 160);
  const description = normalizeText(input.description, "Description", 2000);
  const slug = await buildUniqueTemplateSlug(title);

  const [createdTemplate] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: input.categoryId,
      activityId: input.activityId ?? null,
      title,
      description,
      slug,
      status: input.status,
      versionNumber: 1,
      createdByUserId: input.adminUserId,
      updatedByUserId: input.adminUserId,
    })
    .returning();

  return createdTemplate;
}

export async function updateAdminTemplateMeta(input: {
  templateId: number;
  title: string;
  description: string;
  status: typeof checklistTemplates.$inferSelect["status"];
  categoryId: number;
  activityId?: number | null;
  adminUserId: number;
}) {
  const title = normalizeText(input.title, "Title", 160);
  const description = normalizeText(input.description, "Description", 2000);

  const [updated] = await db
    .update(checklistTemplates)
    .set({
      title,
      description,
      status: input.status,
      categoryId: input.categoryId,
      activityId: input.activityId ?? null,
      updatedByUserId: input.adminUserId,
    })
    .where(eq(checklistTemplates.id, input.templateId))
    .returning();

  if (!updated) {
    throw new Error("Template not found");
  }

  return updated;
}

export async function addTemplateSection(input: {
  templateId: number;
  title: string;
  description?: string | null;
}) {
  const [{ sortOrder }] = await db
    .select({ sortOrder: max(templateSections.sortOrder) })
    .from(templateSections)
    .where(eq(templateSections.templateId, input.templateId));

  const [createdSection] = await db
    .insert(templateSections)
    .values({
      templateId: input.templateId,
      title: normalizeText(input.title, "Section title", 160),
      description: input.description?.trim() || null,
      sortOrder: (sortOrder ?? -1) + 1,
    })
    .returning();

  return createdSection;
}

export async function updateTemplateSection(input: {
  sectionId: number;
  title: string;
  description?: string | null;
}) {
  const [updated] = await db
    .update(templateSections)
    .set({
      title: normalizeText(input.title, "Section title", 160),
      description: input.description?.trim() || null,
    })
    .where(eq(templateSections.id, input.sectionId))
    .returning();

  if (!updated) {
    throw new Error("Section not found");
  }

  return updated;
}

export async function deleteTemplateSection(sectionId: number) {
  const [deleted] = await db
    .delete(templateSections)
    .where(eq(templateSections.id, sectionId))
    .returning();

  if (!deleted) {
    throw new Error("Section not found");
  }

  return deleted;
}

export async function addTemplateItem(input: {
  sectionId: number;
  text: string;
  description?: string | null;
  isRequired?: boolean;
}) {
  const [{ sortOrder }] = await db
    .select({ sortOrder: max(templateItems.sortOrder) })
    .from(templateItems)
    .where(eq(templateItems.sectionId, input.sectionId));

  const [createdItem] = await db
    .insert(templateItems)
    .values({
      sectionId: input.sectionId,
      text: normalizeText(input.text, "Item text", 240),
      description: input.description?.trim() || null,
      isRequired: input.isRequired ?? false,
      sortOrder: (sortOrder ?? -1) + 1,
    })
    .returning();

  return createdItem;
}

export async function updateTemplateItem(input: {
  itemId: number;
  text: string;
  description?: string | null;
  isRequired?: boolean;
}) {
  const [updated] = await db
    .update(templateItems)
    .set({
      text: normalizeText(input.text, "Item text", 240),
      description: input.description?.trim() || null,
      isRequired: input.isRequired ?? false,
    })
    .where(eq(templateItems.id, input.itemId))
    .returning();

  if (!updated) {
    throw new Error("Item not found");
  }

  return updated;
}

export async function deleteTemplateItem(itemId: number) {
  const [deleted] = await db
    .delete(templateItems)
    .where(eq(templateItems.id, itemId))
    .returning();

  if (!deleted) {
    throw new Error("Item not found");
  }

  return deleted;
}

export async function listAdminCategories(params: AdminCategoryListParams = {}) {
  const { page, pageSize, offset } = normalizePaging(params);

  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      activityCount: countDistinct(activities.id),
      templateCount: countDistinct(checklistTemplates.id),
    })
    .from(categories)
    .leftJoin(activities, eq(activities.categoryId, categories.id))
    .leftJoin(checklistTemplates, eq(checklistTemplates.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.name))
    .limit(pageSize)
    .offset(offset);

  const [{ total }] = await db.select({ total: count() }).from(categories);

  return {
    data: rows,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

export async function listAdminActivities(params: AdminActivityListParams = {}) {
  const { page, pageSize, offset } = normalizePaging(params);

  const rows = await db
    .select({
      id: activities.id,
      name: activities.name,
      slug: activities.slug,
      description: activities.description,
      category: {
        id: categories.id,
        name: categories.name,
      },
    })
    .from(activities)
    .innerJoin(categories, eq(activities.categoryId, categories.id))
    .orderBy(asc(categories.name), asc(activities.name))
    .limit(pageSize)
    .offset(offset);

  const [{ total }] = await db.select({ total: count() }).from(activities);

  return {
    data: rows,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

export async function createCategory(input: {
  name: string;
  description?: string | null;
  slug?: string | null;
}) {
  const name = normalizeText(input.name, "Category name", 120);
  const slug = input.slug?.trim() || slugify(name);

  const [created] = await db
    .insert(categories)
    .values({
      name,
      slug,
      description: input.description?.trim() || null,
    })
    .returning();

  return created;
}

export async function createActivity(input: {
  categoryId: number;
  name: string;
  description?: string | null;
  slug?: string | null;
}) {
  const name = normalizeText(input.name, "Activity name", 120);
  const slug = input.slug?.trim() || slugify(name);

  const [created] = await db
    .insert(activities)
    .values({
      categoryId: input.categoryId,
      name,
      slug,
      description: input.description?.trim() || null,
    })
    .returning();

  return created;
}

export async function listAdminUsers(params: AdminUserListParams = {}) {
  const { page, pageSize, offset } = normalizePaging(params);

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [{ total }] = await db.select({ total: count() }).from(users);

  return {
    data: rows,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

export async function updateUserRole(input: {
  userId: number;
  role: typeof users.$inferSelect["role"];
  adminUserId: number;
}) {
  if (input.userId === input.adminUserId) {
    throw new Error("You cannot change your own role.");
  }

  if (input.role !== "admin") {
    const [{ totalAdmins }] = await db
      .select({ totalAdmins: count() })
      .from(users)
      .where(eq(users.role, "admin"));

    if (totalAdmins <= 1) {
      throw new Error("At least one admin is required.");
    }
  }

  const [updated] = await db
    .update(users)
    .set({ role: input.role })
    .where(eq(users.id, input.userId))
    .returning();

  if (!updated) {
    throw new Error("User not found");
  }

  return updated;
}
