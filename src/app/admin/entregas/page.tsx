import { requirePage } from "@/lib/guard";
import AdminShell from "@/components/admin/AdminShell";
import DeliveryManager from "@/components/admin/DeliveryManager";

export const dynamic = "force-dynamic";

export default async function AdminDeliveriesPage() {
  const { session, db, newOrders, unreadChats } = await requirePage([
    "dono",
    "atendente",
  ]);

  const deliveryOrders = db.orders.filter((o) => o.type === "delivery");
  const drivers = db.users.filter((u) => u.role === "entregador");

  return (
    <AdminShell
      storeName={db.settings.storeName}
      newOrders={newOrders}
      unreadChats={unreadChats}
      role={session.role}
      userName={session.name}
      isOpen={db.settings.isOpen}
    >
      <DeliveryManager
        orders={deliveryOrders}
        drivers={drivers}
        zones={db.settings.deliveryZones ?? []}
      />
    </AdminShell>
  );
}
