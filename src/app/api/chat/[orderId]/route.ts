import { NextResponse } from "next/server";
import { mutateDb, getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { ChatMessage } from "@/lib/types";

const STAFF_ROLES = ["dono", "atendente", "cozinha"];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  const session = await getSession();
  const isStaff = session ? STAFF_ROLES.includes(session.role) : false;

  const db = await getDb();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) {
    return NextResponse.json(
      { ok: false, error: "Pedido não encontrado." },
      { status: 404 },
    );
  }

  const thread = db.messages
    .filter((m) => m.orderId === orderId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const hasUnread = thread.some((m) =>
    isStaff
      ? m.from === "cliente" && !m.readByStore
      : m.from === "loja" && !m.readByCustomer,
  );

  if (hasUnread) {
    await mutateDb((data) => {
      for (const message of data.messages) {
        if (message.orderId !== orderId) continue;
        if (isStaff && message.from === "cliente") message.readByStore = true;
        if (!isStaff && message.from === "loja") message.readByCustomer = true;
      }
    });
  }

  return NextResponse.json({ ok: true, messages: thread, isStaff });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  const session = await getSession();
  const isStaff = session ? STAFF_ROLES.includes(session.role) : false;

  let body: { text?: string };
  try {
    body = (await request.json()) as { text?: string };
  } catch {
    return NextResponse.json(
      { ok: false, error: "Mensagem inválida." },
      { status: 400 },
    );
  }

  const text = String(body.text ?? "").trim().slice(0, 1000);
  if (!text) {
    return NextResponse.json(
      { ok: false, error: "Escreva uma mensagem." },
      { status: 400 },
    );
  }

  const result = await mutateDb((db) => {
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) return null;

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      orderId,
      from: isStaff ? "loja" : "cliente",
      author: isStaff ? (session?.name ?? "Loja") : order.customerName,
      text,
      createdAt: new Date().toISOString(),
      readByStore: isStaff,
      readByCustomer: !isStaff,
    };

    db.messages.push(message);
    return message;
  });

  if (!result) {
    return NextResponse.json(
      { ok: false, error: "Pedido não encontrado." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, message: result });
}
