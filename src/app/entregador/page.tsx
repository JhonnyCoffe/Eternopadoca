import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import DriverPanel from "@/components/driver/DriverPanel";

export const dynamic = "force-dynamic";

export default async function DriverPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login?next=/entregador");

  const db = await getDb();

  const deliveries = db.orders.filter(
    (o) =>
      o.type === "delivery" &&
      (o.status === "pronto" || o.status === "saiu" || o.status === "concluido"),
  );

  return (
    <DriverPanel
      user={session}
      storeName={db.settings.storeName}
      orders={deliveries}
    />
  );
}
