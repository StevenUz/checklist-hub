import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const docsPath = path.join(process.cwd(), "public", "api-docs.html");
  const html = await readFile(docsPath, "utf8");

  return new NextResponse(html, {
    headers: {
      "cache-control": "public, max-age=300",
      "content-type": "text/html; charset=utf-8",
    },
  });
}
