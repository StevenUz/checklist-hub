import { NextRequest, NextResponse } from "next/server";
import type {
  CreateSuggestionRequestDto,
  PaginatedDto,
  SuggestionDto,
} from "@checklisthub/shared";

import { requireApiUser } from "@/lib/apiAuth";
import { createSuggestion, type SuggestionType } from "@/services/suggestionService";
import { listUserSuggestions } from "@/services/suggestionService";

const allowedTypes: SuggestionType[] = [
  "new_activity",
  "new_template",
  "template_edit",
  "template_variant",
];

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value ?? String(fallback));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request: NextRequest) {
  const auth = await requireApiUser(request);

  if (!auth.ok) {
    return auth.response;
  }

  const response: PaginatedDto<SuggestionDto> = await listUserSuggestions({
    userId: auth.user.id,
    page: parsePositiveInt(request.nextUrl.searchParams.get("page"), 1),
    pageSize: parsePositiveInt(request.nextUrl.searchParams.get("pageSize"), 8),
  });

  return NextResponse.json(response);
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser(request);

  if (!auth.ok) {
    return auth.response;
  }

  let payload: Partial<CreateSuggestionRequestDto>;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload.type || !allowedTypes.includes(payload.type)) {
    return NextResponse.json({ error: "Invalid suggestion type" }, { status: 400 });
  }

  try {
    const suggestion = await createSuggestion({
      userId: auth.user.id,
      type: payload.type,
      title: payload.title ?? "",
      description: payload.description ?? "",
      targetTemplateId: payload.targetTemplateId ?? null,
    });

    return NextResponse.json({ data: suggestion }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit suggestion.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
