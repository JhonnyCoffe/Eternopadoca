"use server";

import { getDb } from "@/lib/db";

export async function getStoreData() {
  const db = await getDb();
  return {
    settings: db.settings,
    categories: db.categories,
    products: db.products,
  };
}
