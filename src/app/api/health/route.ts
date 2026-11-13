import { NextResponse } from "next/server";
import { constants } from "fs";
import { access } from "fs/promises";
import path from "path";

// Healthcheck usado pelo Docker/Caddy. Nao expoe detalhes internos.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await access(path.join(process.cwd(), "data"), constants.W_OK);
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
