import { NextRequest, NextResponse } from "next/server";
import type { AuthResponseDto, RegisterRequestDto } from "@checklisthub/shared";

import { createSessionToken } from "@/lib/session";
import { registerUser } from "@/services/authService";

export async function POST(request: NextRequest) {
  let payload: Partial<RegisterRequestDto>;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = await registerUser({
    name: payload.name ?? "",
    email: payload.email ?? "",
    password: payload.password ?? "",
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const response: AuthResponseDto = {
    token: await createSessionToken(result.user),
    user: result.user,
  };

  return NextResponse.json(response, { status: 201 });
}
