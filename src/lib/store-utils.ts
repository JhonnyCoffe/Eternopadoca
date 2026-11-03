import type { Order, Product } from "./types";

export function isLowStock(product: Product): boolean {
  if (!product.trackStock) return false;
  const low = product.lowStockAt ?? 5;
  return (product.stock ?? 0) <= low;
}

export function orderCost(order: Order): number {
  return order.items.reduce(
    (sum, item) => sum + (item.cost ?? 0) * item.qty,
    0,
  );
}
