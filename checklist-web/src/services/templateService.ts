import { and, asc, count, desc, eq, ilike, or } from "drizzle-orm";

import { db } from "@/db";
import {
  activities,
  categories,
  checklistTemplates,
  templateItems,
  templateSections,
} from "@/db/schema";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

export type TemplateListParams = {
  page?: number;
  pageSize?: number;
  query?: string;
  category?: string;
};

export async function listTemplateCategories() {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
    })
    .from(categories)
    .orderBy(asc(categories.name));
}

function normalizePaging(params: TemplateListParams) {
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

function buildTemplateFilters(params: TemplateListParams) {
  const filters = [eq(checklistTemplates.status, "published")];
  const query = params.query?.trim();
  const category = params.category?.trim();

  if (query) {
    filters.push(
      or(
        ilike(checklistTemplates.title, `%${query}%`),
        ilike(checklistTemplates.description, `%${query}%`),
      )!,
    );
  }

  if (category) {
    filters.push(eq(categories.slug, category));
  }

  return and(...filters);
}

export async function listTemplates(params: TemplateListParams = {}) {
  const { page, pageSize, offset } = normalizePaging(params);
  const where = buildTemplateFilters(params);

  const rows = await db
    .select({
      id: checklistTemplates.id,
      title: checklistTemplates.title,
      slug: checklistTemplates.slug,
      description: checklistTemplates.description,
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

export async function getTemplateDetails(id: number) {
  const template = await db.query.checklistTemplates.findFirst({
    where: and(eq(checklistTemplates.id, id), eq(checklistTemplates.status, "published")),
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
