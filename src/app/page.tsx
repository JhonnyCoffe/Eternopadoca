import { getDb } from "@/lib/db";
import StoreFront from "@/components/storefront/StoreFront";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const db = await getDb();
  return (
    <StoreFront
      settings={db.settings}
      categories={db.categories}
      products={db.products}
    />
  );
}
