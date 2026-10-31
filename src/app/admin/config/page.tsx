import { requirePage } from "@/lib/guard";
import AdminShell from "@/components/admin/AdminShell";
import SettingsForm from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
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
      <SettingsForm settings={db.settings} />
    </AdminShell>
  );
}
