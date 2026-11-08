import { NextResponse } from "next/server";
import { createDataRequest, type DataRequest } from "@/lib/data-requests";

export async function POST(request: Request) {
  let body: { type: DataRequest["type"]; name: string; email?: string; phone?: string; orderCode?: string; message?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }

  if (!body.name || body.name.trim().length < 2) {
    return NextResponse.json({ ok: false, error: "Informe seu nome." }, { status: 400 });
  }
  if (!["access", "deletion", "rectification"].includes(body.type)) {
    return NextResponse.json({ ok: false, error: "Tipo de solicitação inválido." }, { status: 400 });
  }

  const created = await createDataRequest({
    type: body.type,
    name: body.name.trim(),
    email: body.email?.trim() || undefined,
    phone: body.phone?.trim() || undefined,
    orderCode: body.orderCode?.trim() || undefined,
    message: body.message?.trim() || undefined,
  });

  return NextResponse.json({ ok: true, request: created });
}
