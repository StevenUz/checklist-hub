import { NextRequest, NextResponse } from "next/server";
import type { ApiDataDto, UserDto } from "@checklisthub/shared";

import { requireApiUser } from "@/lib/apiAuth";

export async function GET(request: NextRequest) {
  const auth = await requireApiUser(request);

  if (!auth.ok) {
    return auth.response;
  }

  const response: ApiDataDto<UserDto> = {
    data: auth.user,
  };

  return NextResponse.json(response);
}
