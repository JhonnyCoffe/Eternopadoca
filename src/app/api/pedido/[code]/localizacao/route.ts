import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { verifyTrackingToken } from "@/lib/tracking-token";
import { getDeliveryLocation, saveDeliveryLocation } from "@/lib/location";
import type { DeliveryLocation } from "@/lib/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const session = await getSession();
  const db = await getDb();
  const order = db.orders.find((o) => o.code.toUpperCase() === code.toUpperCase());
  if (!session || session.role !== "entregador" || !order || order.driverId !== session.userId)
    return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 403 });
  if (order.status !== "saiu")
    return NextResponse.json({ ok: false, error: "Status inválido." }, { status: 400 });

  const body = (await request.json().catch(() => ({}))) as Partial<DeliveryLocation>;
  if (!body || typeof body.latitude !== "number" || typeof body.longitude !== "number")
    return NextResponse.json({ ok: false, error: "Payload inválido." }, { status: 400 });

  const location: DeliveryLocation = {
    orderId: order.id,
    latitude: body.latitude,
    longitude: body.longitude,
    accuracy: body.accuracy ?? undefined,
    heading: body.heading ?? undefined,
    speed: body.speed ?? undefined,
    updatedAt: new Date().toISOString(),
  };
  await saveDeliveryLocation(location);
  return NextResponse.json({ ok: true, location });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const url = new URL(_request.url ?? "");
  const token = url.searchParams.get("token");
  const db = await getDb();
  const order = db.orders.find((o) => o.code.toUpperCase() === code.toUpperCase());
  if (!order || !token || !verifyTrackingToken(token, order.id, order.code))
    return NextResponse.json({ ok: false, error: "Token inválido." }, { status: 403 });
  const location = await getDeliveryLocation(order.id);
  return NextResponse.json({ ok: true, location, status: order.status });
}
