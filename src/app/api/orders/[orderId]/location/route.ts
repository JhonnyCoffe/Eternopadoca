import { NextRequest, NextResponse } from "next/server";
import { openSqliteDb, initializeSqlite } from "@/lib/sqlite";

export async function POST(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;
    const body = await req.json();
    const { latitude, longitude, accuracy, heading, speed } = body;

    if (!orderId || latitude == null || longitude == null) {
      return NextResponse.json({ ok: false, error: "Dados incompletos" }, { status: 400 });
    }

    const store = openSqliteDb();
    initializeSqlite(store);

    // Validar pedido em 'saiu'
    const orderRow = store.db.prepare("SELECT data FROM orders WHERE id = ?").get(orderId) as { data: string } | undefined;
    if (!orderRow) {
      store.close();
      return NextResponse.json({ ok: false, error: "Pedido não encontrado" }, { status: 404 });
    }
    const order = JSON.parse(orderRow.data);
    if (order.status !== "saiu") {
      store.close();
      return NextResponse.json({ ok: false, error: "Status não permite localização" }, { status: 403 });
    }

    store.db.prepare(`
      INSERT INTO order_locations (order_id, latitude, longitude, accuracy, heading, speed, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(order_id) DO UPDATE SET
        latitude = excluded.latitude,
        longitude = excluded.longitude,
        accuracy = excluded.accuracy,
        heading = excluded.heading,
        speed = excluded.speed,
        updated_at = excluded.updated_at
    `).run(orderId, latitude, longitude, accuracy ?? null, heading ?? null, speed ?? null, new Date().toISOString());

    store.close();
    return NextResponse.json({ ok: true, updatedAt: new Date().toISOString() });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
