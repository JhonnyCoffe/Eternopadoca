import { requirePage } from "@/lib/guard";
import AdminShell from "@/components/admin/AdminShell";
import UsersManager from "@/components/admin/UsersManager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const { session, db, newOrders, unreadChats } = await requirePage(["dono"]);

  return (
    <AdminShell
      storeName={db.settings.storeName}
      newOrders={newOrders}
      unreadChats={unreadChats}
      role={session.role}
      userName={session.name}
      isOpen={db.settings.isOpen}
    >
      <UsersManager users={db.users} currentUserId={session.userId} />
    </AdminShell>
  );
}
