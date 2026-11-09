import { requirePage } from "@/lib/guard";
import AdminShell from "@/components/admin/AdminShell";
import ShoppingListPanel from "@/components/admin/ShoppingListPanel";

export const dynamic = "force-dynamic";

export default async function AdminShoppingListPage() {
  const { session, db, newOrders, unreadChats } = await requirePage([
    "dono",
    "atendente",
  ]);

  return (
    <AdminShell
      storeName={db.settings.storeName}
      newOrders={newOrders}
      unreadChats={unreadChats}
      role={session.role}
      userName={session.name}
      isOpen={db.settings.isOpen}
    >
      <ShoppingListPanel
        products={db.products}
        categories={db.categories}
      />
    </AdminShell>
  );
}