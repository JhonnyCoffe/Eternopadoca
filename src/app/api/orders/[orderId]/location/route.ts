import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { saveDeliveryLocation } from "@/lib/location";

export async function POST(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;
    const body = await req.json();
    const { latitude, longitude, accuracy, heading, speed } = body;

    if (!orderId || latitude == null || longitude == null) {
      return NextResponse.json({ ok: false, error: "Dados incompletos" }, { status: 400 });
    }

    const db = await getDb();
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) {
      return NextResponse.json({ ok: false, error: "Pedido não encontrado" }, { status: 404 });
    }
    if (order.status !== "saiu") {
      return NextResponse.json({ ok: false, error: "Status não permite localização" }, { status: 403 });
    }

    const updatedAt = new Date().toISOString();
    await saveDeliveryLocation({ orderId, latitude, longitude, accuracy, heading, speed, updatedAt });

    return NextResponse.json({ ok: true, updatedAt });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
