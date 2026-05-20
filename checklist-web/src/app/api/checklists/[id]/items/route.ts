import { NextRequest, NextResponse } from "next/server";
import type { AddChecklistItemRequestDto } from "@checklisthub/shared";

import { requireApiUser } from "@/lib/apiAuth";
import { addChecklistItem, getUserChecklistDetails } from "@/services/checklistService";

type ChecklistItemsRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, { params }: ChecklistItemsRouteContext) {
  const auth = await requireApiUser(request);

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;
  const checklistId = Number(id);

  if (!Number.isInteger(checklistId) || checklistId <= 0) {
    return NextResponse.json({ error: "Invalid checklist id" }, { status: 400 });
  }

  let payload: Partial<AddChecklistItemRequestDto>;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Number.isInteger(payload.sectionId) || Number(payload.sectionId) <= 0) {
    return NextResponse.json({ error: "Invalid sectionId" }, { status: 400 });
  }

  if (!payload.text?.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const checklist = await getUserChecklistDetails({
    checklistId,
    userId: auth.user.id,
  });

  if (!checklist) {
    return NextResponse.json({ error: "Checklist not found" }, { status: 404 });
  }

  if (!checklist.sections.some((section) => section.id === payload.sectionId)) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  try {
    await addChecklistItem({
      sectionId: Number(payload.sectionId),
      userId: auth.user.id,
      text: payload.text,
    });

    const updated = await getUserChecklistDetails({ checklistId, userId: auth.user.id });
    return NextResponse.json({ data: updated }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to add item.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
