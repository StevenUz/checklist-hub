import { NextRequest, NextResponse } from "next/server";
import type { PaginatedDto, TemplateListItemDto } from "@checklisthub/shared";

import { listTemplates } from "@/services/templateService";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "10");

  const templates: PaginatedDto<TemplateListItemDto> = await listTemplates({
    query: searchParams.get("q") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    page: Number.isInteger(page) && page > 0 ? page : 1,
    pageSize: Number.isInteger(pageSize) && pageSize > 0 ? pageSize : 10,
  });

  return NextResponse.json(templates);
}
