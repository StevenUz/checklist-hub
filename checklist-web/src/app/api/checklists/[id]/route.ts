import { NextRequest, NextResponse } from "next/server";
import type { ApiDataDto, ChecklistDetailsDto } from "@checklisthub/shared";

import { requireApiUser } from "@/lib/apiAuth";
import { getUserChecklistDetails } from "@/services/checklistService";

type ChecklistRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, { params }: ChecklistRouteContext) {
  const auth = await requireApiUser(request);

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;
  const checklistId = Number(id);

  if (!Number.isInteger(checklistId) || checklistId <= 0) {
    return NextResponse.json({ error: "Invalid checklist id" }, { status: 400 });
  }

  const checklist = await getUserChecklistDetails({
    checklistId,
    userId: auth.user.id,
  });

  if (!checklist) {
    return NextResponse.json({ error: "Checklist not found" }, { status: 404 });
  }

  const response: ApiDataDto<ChecklistDetailsDto> = {
    data: checklist,
  };

  return NextResponse.json(response);
}
