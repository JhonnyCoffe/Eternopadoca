import { requirePage } from "@/lib/guard";
import AdminShell from "@/components/admin/AdminShell";
import ProductsManager from "@/components/admin/ProductsManager";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const { session, db, newOrders, unreadChats } = await requirePage([
    "dono",
    "atendente",
    "cozinha",
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
      <ProductsManager
        categories={db.categories}
        products={db.products}
        canEdit={session.role !== "cozinha"}
      />
    </AdminShell>
  );
}
