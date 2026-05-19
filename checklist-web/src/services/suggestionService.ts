import { asc, count, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { checklistTemplates, suggestionComments, suggestions } from "@/db/schema";

const DEFAULT_PAGE_SIZE = 8;
const MAX_PAGE_SIZE = 50;
const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_COMMENT_LENGTH = 1000;

export type SuggestionType = typeof suggestions.$inferInsert["type"];

type PagingParams = {
  page?: number;
  pageSize?: number;
};

export type SuggestionListParams = PagingParams & {
  userId: number;
};

function normalizePaging(params: PagingParams) {
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

function normalizeText(value: string, fieldName: string, maxLength: number) {
  const text = value.trim();

  if (!text) {
    throw new Error(`${fieldName} is required`);
  }

  if (text.length > maxLength) {
    throw new Error(`${fieldName} must be ${maxLength} characters or fewer`);
  }

  return text;
}

function shouldRequireTemplateId(type: SuggestionType) {
  return type === "template_edit" || type === "template_variant";
}

export async function listUserSuggestions(params: SuggestionListParams) {
  const { page, pageSize, offset } = normalizePaging(params);

  const rows = await db.query.suggestions.findMany({
    where: eq(suggestions.userId, params.userId),
    orderBy: [desc(suggestions.createdAt), desc(suggestions.id)],
    limit: pageSize,
    offset,
    with: {
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
    .where(eq(suggestions.userId, params.userId));

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

export async function createSuggestion(input: {
  userId: number;
  type: SuggestionType;
  title: string;
  description: string;
  targetTemplateId?: number | null;
}) {
  const title = normalizeText(input.title, "Title", MAX_TITLE_LENGTH);
  const description = normalizeText(input.description, "Description", MAX_DESCRIPTION_LENGTH);
  const targetTemplateId =
    typeof input.targetTemplateId === "number" && input.targetTemplateId > 0
      ? input.targetTemplateId
      : null;

  if (shouldRequireTemplateId(input.type) && !targetTemplateId) {
    throw new Error("Template id is required for this suggestion type");
  }

  if (targetTemplateId) {
    const template = await db.query.checklistTemplates.findFirst({
      where: eq(checklistTemplates.id, targetTemplateId),
    });

    if (!template) {
      throw new Error("Template not found");
    }
  }

  const [created] = await db
    .insert(suggestions)
    .values({
      userId: input.userId,
      type: input.type,
      title,
      description,
      targetTemplateId,
      status: "pending",
    })
    .returning();

  return created;
}

export async function addSuggestionComment(input: {
  userId: number;
  suggestionId: number;
  text: string;
}) {
  const text = normalizeText(input.text, "Comment", MAX_COMMENT_LENGTH);

  const suggestion = await db.query.suggestions.findFirst({
    where: eq(suggestions.id, input.suggestionId),
    columns: {
      id: true,
      userId: true,
    },
  });

  if (!suggestion || suggestion.userId !== input.userId) {
    throw new Error("Suggestion not found");
  }

  await db.insert(suggestionComments).values({
    suggestionId: suggestion.id,
    userId: input.userId,
    text,
  });

  return suggestion.id;
}
