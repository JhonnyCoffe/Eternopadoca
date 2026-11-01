import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const db = await getDb();
  const order = db.orders.find((item) => item.code.toUpperCase() === code.toUpperCase());
  if (!order) return NextResponse.json({ ok: false, error: "Pedido não encontrado." }, { status: 404 });
  return NextResponse.json({ ok: true, order, settings: db.settings });
}
