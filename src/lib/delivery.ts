import type { Order } from "./types";

export function isVisibleToDriver(order: Order, userId: string): boolean {
  if (order.type !== "delivery") return false;
  if (order.status === "pronto") return !order.driverId || order.driverId === userId;
  return order.driverId === userId && ["saiu", "chegou", "concluido"].includes(order.status);
}
