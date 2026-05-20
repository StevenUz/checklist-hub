import { NextRequest, NextResponse } from "next/server";
import type { ToggleChecklistItemResponseDto } from "@checklisthub/shared";

import { requireApiUser } from "@/lib/apiAuth";
import { getUserChecklistDetails, toggleChecklistItem } from "@/services/checklistService";

type ToggleItemRouteContext = {
  params: Promise<{
    id: string;
    itemId: string;
  }>;
};

export async function POST(request: NextRequest, { params }: ToggleItemRouteContext) {
  const auth = await requireApiUser(request);

  if (!auth.ok) {
    return auth.response;
  }

  const { id, itemId } = await params;
  const checklistId = Number(id);
  const parsedItemId = Number(itemId);

  if (!Number.isInteger(checklistId) || checklistId <= 0) {
    return NextResponse.json({ error: "Invalid checklist id" }, { status: 400 });
  }

  if (!Number.isInteger(parsedItemId) || parsedItemId <= 0) {
    return NextResponse.json({ error: "Invalid item id" }, { status: 400 });
  }

  const checklist = await getUserChecklistDetails({ checklistId, userId: auth.user.id });

  if (!checklist) {
    return NextResponse.json({ error: "Checklist not found" }, { status: 404 });
  }

  const itemBelongsToChecklist = checklist.sections.some((section) =>
    section.items.some((item) => item.id === parsedItemId),
  );

  if (!itemBelongsToChecklist) {
    return NextResponse.json({ error: "Checklist item not found" }, { status: 404 });
  }

  try {
    const updatedChecklistId = await toggleChecklistItem({
      itemId: parsedItemId,
      userId: auth.user.id,
    });
    const response: ToggleChecklistItemResponseDto = { checklistId: updatedChecklistId };

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to toggle item.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
