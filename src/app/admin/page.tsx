import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";
import Dashboard from "@/components/admin/Dashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getSession();
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

  return (
    <AdminShell
      storeName={db.settings.storeName}
      newOrders={newOrders}
      unreadChats={unreadChats}
      role={session?.role ?? "dono"}
      userName={session?.name ?? "Administrador"}
      isOpen={db.settings.isOpen}
    >
      <Dashboard
        settings={db.settings}
        orders={db.orders}
        categories={db.categories}
        products={db.products}
      />
    </AdminShell>
  );
}
