import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { openSqliteDb, initializeSqlite } from "@/lib/sqlite.cjs";

type Row = { id: string; subdomain: string; name: string; active: number; created_at: string };

function all(db: any, sql: string, params: unknown[] = []): Promise<Row[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err: Error | null, rows: Row[]) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

function run(db: any, sql: string, params: unknown[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err: Error | null) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "dono") return NextResponse.json({ error: "Negado" }, { status: 403 });
  const s: any = openSqliteDb();
  try {
    await initializeSqlite(s);
    const rows = await all(s.db, "SELECT id, subdomain, name, active, created_at FROM stores");
    return NextResponse.json({ ok: true, stores: rows.map((r) => ({ ...r, active: !!r.active })) });
  } finally {
    s.close();
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "dono") return NextResponse.json({ error: "Negado" }, { status: 403 });
  const body = await req.json();
  const { id, subdomain, name } = body || {};
  if (!id || !subdomain || !name) return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });
  const s: any = openSqliteDb();
  try {
    await initializeSqlite(s);
    await run(s.db, "INSERT INTO stores (id, subdomain, name, active, created_at) VALUES (?, ?, ?, 1, ?)", [id, subdomain, name, new Date().toISOString()]);
  } catch {
    return NextResponse.json({ error: "Já existe" }, { status: 409 });
  } finally {
    s.close();
  }
  return NextResponse.json({ ok: true, id, subdomain });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "dono") return NextResponse.json({ error: "Negado" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });
  const s: any = openSqliteDb();
  try {
    await initializeSqlite(s);
    await run(s.db, "DELETE FROM stores WHERE id = ?", [id]);
  } finally {
    s.close();
  }
  return NextResponse.json({ ok: true });
}
