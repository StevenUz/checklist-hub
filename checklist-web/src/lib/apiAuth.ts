import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, verifySessionToken, type SessionUser } from "@/lib/session";

export type AuthenticatedApiResult =
  | {
      ok: true;
      user: SessionUser;
    }
  | {
      ok: false;
      response: NextResponse;
    };

export async function getApiUser(request: NextRequest) {
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

export async function requireApiUser(request: NextRequest): Promise<AuthenticatedApiResult> {
  const user = await getApiUser(request);

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { ok: true, user };
}
