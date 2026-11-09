"use server";

import { getDb } from "@/lib/db";

export async function getProductById(id: string) {
  const db = await getDb();
  const product = db.products.find((p) => p.id === id);
  if (!product) return null;
  return product;
}
