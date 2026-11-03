import { NextRequest, NextResponse } from "next/server";
import { getStoreBySubdomain } from "@/lib/store-db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const sub = req.nextUrl.searchParams.get("sub");
  if (!sub) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    const store = await getStoreBySubdomain(sub);
    return NextResponse.json({ ok: true, store: store ?? null });
  } catch {
    return NextResponse.json({ ok: false, store: null });
  }
}
