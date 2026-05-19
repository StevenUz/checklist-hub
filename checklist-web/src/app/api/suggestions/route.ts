import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/session";
import { createSuggestion, type SuggestionType } from "@/services/suggestionService";

const allowedTypes: SuggestionType[] = [
  "new_activity",
  "new_template",
  "template_edit",
  "template_variant",
];

async function getApiUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice("Bearer ".length).trim();
    if (token) {
      return verifySessionToken(token);
    }
  }

  const cookieToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  return cookieToken ? verifySessionToken(cookieToken) : null;
}

export async function POST(request: NextRequest) {
  const user = await getApiUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: {
    type?: SuggestionType;
    title?: string;
    description?: string;
    targetTemplateId?: number | null;
  };

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
      userId: user.id,
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
