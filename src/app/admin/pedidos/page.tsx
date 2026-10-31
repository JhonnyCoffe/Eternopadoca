import { requirePage } from "@/lib/guard";
import AdminShell from "@/components/admin/AdminShell";
import OrdersBoard from "@/components/admin/OrdersBoard";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const { session, db, newOrders, unreadChats } = await requirePage([
    "dono",
    "atendente",
    "cozinha",
  ]);

  const orders = [...db.orders].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  return (
    <AdminShell
      storeName={db.settings.storeName}
      newOrders={newOrders}
      unreadChats={unreadChats}
      role={session.role}
      userName={session.name}
      isOpen={db.settings.isOpen}
    >
      <OrdersBoard
        orders={orders}
        role={session.role}
        drivers={db.users.filter((u) => u.role === "entregador" && u.active)}
      />
    </AdminShell>
  );
}
