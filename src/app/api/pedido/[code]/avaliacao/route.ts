import { NextResponse } from "next/server";
import { mutateDb } from "@/lib/db";
import { saveOrderRating } from "@/lib/rating";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  let body: { rating?: unknown };
  try {
    body = (await request.json()) as { rating?: unknown };
  } catch {
    return NextResponse.json({ ok: false, error: "Nota inválida." }, { status: 400 });
  }
  const result = await mutateDb((db) => saveOrderRating(db, code, Number(body.rating)));
  if (!result.ok) return NextResponse.json(result, { status: result.status });
  return NextResponse.json(result);
}
