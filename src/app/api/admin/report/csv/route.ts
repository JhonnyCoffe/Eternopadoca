import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "dono") return NextResponse.json({ error: "Negado" }, { status: 403 });
  const db = await getDb();
  const orders = db.orders.filter((o) => o.status !== "cancelado");
  const lines = ["code,customer,status,payment,total,createdAt"];
  for (const o of orders) {
    lines.push(`${o.code},"${o.customerName || ""}",${o.status},${o.payment},${o.total},${o.createdAt}`);
  }
  const csv = lines.join("\n");
  return new NextResponse(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=relatorio.csv" },
  });
}
