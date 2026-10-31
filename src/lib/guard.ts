import { redirect } from "next/navigation";
import { getSession } from "./auth";
import { getDb } from "./db";
import { ROLE_HOME, type Db, type Role } from "./types";

/**
 * Protege páginas do painel e devolve o contexto comum (sessão + banco).
 * Usuários sem permissão são levados para a área que podem acessar.
 */
export async function requirePage(roles: Role[]): Promise<{
  session: { userId: string; name: string; role: Role };
  db: Db;
  newOrders: number;
  unreadChats: number;
}> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!roles.includes(session.role)) redirect(ROLE_HOME[session.role]);

  const db = await getDb();
  const newOrders = db.orders.filter((o) => o.status === "novo").length;

  const staffOrderIds = new Set(
    db.orders
      .filter((o) => o.status !== "concluido" && o.status !== "cancelado")
      .map((o) => o.id),
  );
  const unreadChats = db.messages.filter(
    (m) => m.from === "cliente" && !m.readByStore && staffOrderIds.has(m.orderId),
  ).length;

  return { session, db, newOrders, unreadChats };
}
