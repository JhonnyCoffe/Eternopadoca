import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createResetToken } from "@/lib/password-reset";

export async function POST(request: Request) {
  let body: { username?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Envio inválido." }, { status: 400 });
  }

  const username = (body.username ?? "").trim();
  if (!username) {
    return NextResponse.json({ ok: false, error: "Informe o usuário." }, { status: 400 });
  }

  const db = await getDb();
  const user = db.users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase() && u.active,
  );

  // Resposta genérica para não revelar se o usuário existe.
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const token = await createResetToken(user.id);
  const resetUrl = `/admin/reset-password?token=${encodeURIComponent(token)}`;

  return NextResponse.json({ ok: true, resetUrl });
}