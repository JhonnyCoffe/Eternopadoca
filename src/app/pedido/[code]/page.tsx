import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import TrackingView from "@/components/tracking/TrackingView";

export const dynamic = "force-dynamic";

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const db = await getDb();
  const order = db.orders.find(
    (o) => o.code.toUpperCase() === code.toUpperCase(),
  );

  if (!order) notFound();

  return <TrackingView order={order} settings={db.settings} />;
}
