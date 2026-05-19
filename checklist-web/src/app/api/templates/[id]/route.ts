import { NextRequest, NextResponse } from "next/server";

import { getTemplateDetails } from "@/services/templateService";

type TemplateApiRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, { params }: TemplateApiRouteContext) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid template id" }, { status: 400 });
  }

  const template = await getTemplateDetails(id);

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  return NextResponse.json({ data: template });
}
