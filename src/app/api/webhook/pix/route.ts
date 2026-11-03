import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = body?.code || body?.pedido;
    if (!code) return NextResponse.json({ ok: false }, { status: 400 });
    const db = await getDb();
    const order = db.orders.find((o) => o.code === code);
    if (!order) return NextResponse.json({ ok: false, error: "não encontrado" }, { status: 404 });
    order.paymentStatus = "pago";
    order.paidAt = new Date().toISOString();
    await db.save();
    return NextResponse.json({ ok: true, code });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
