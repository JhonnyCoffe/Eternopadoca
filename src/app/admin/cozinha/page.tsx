import { requirePage } from "@/lib/guard";
import AdminShell from "@/components/admin/AdminShell";
import KitchenDisplay from "@/components/admin/KitchenDisplay";

export const dynamic = "force-dynamic";

export default async function KitchenPage() {
  const { session, db, newOrders, unreadChats } = await requirePage([
    "dono",
    "atendente",
    "cozinha",
  ]);

  const queue = db.orders.filter(
    (o) => o.status === "novo" || o.status === "preparando" || o.status === "pronto",
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
      <KitchenDisplay orders={queue} />
    </AdminShell>
  );
}
