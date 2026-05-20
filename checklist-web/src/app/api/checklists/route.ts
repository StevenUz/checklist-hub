import { NextRequest, NextResponse } from "next/server";
import type {
  ChecklistListItemDto,
  CreateChecklistRequestDto,
  PaginatedDto,
} from "@checklisthub/shared";

import { requireApiUser } from "@/lib/apiAuth";
import { createChecklistFromTemplate, listUserChecklists } from "@/services/checklistService";

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value ?? String(fallback));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request: NextRequest) {
  const auth = await requireApiUser(request);

  if (!auth.ok) {
    return auth.response;
  }

  const response: PaginatedDto<ChecklistListItemDto> = await listUserChecklists(auth.user.id, {
    page: parsePositiveInt(request.nextUrl.searchParams.get("page"), 1),
    pageSize: parsePositiveInt(request.nextUrl.searchParams.get("pageSize"), 10),
  });

  return NextResponse.json(response);
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser(request);

  if (!auth.ok) {
    return auth.response;
  }

  let payload: Partial<CreateChecklistRequestDto>;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Number.isInteger(payload.templateId) || Number(payload.templateId) <= 0) {
    return NextResponse.json({ error: "Invalid templateId" }, { status: 400 });
  }

  try {
    const checklist = await createChecklistFromTemplate({
      templateId: Number(payload.templateId),
      userId: auth.user.id,
    });

    return NextResponse.json({ data: checklist }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create checklist.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
