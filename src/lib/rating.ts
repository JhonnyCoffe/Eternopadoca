import type { Db, Order } from "./types";

type RatingResult =
  | { ok: true; order: Order }
  | { ok: false; status: number; error: string };

export function saveOrderRating(db: Db, code: string, rating: number): RatingResult {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, status: 400, error: "Escolha uma nota de 1 a 5 estrelas." };
  }
  const order = db.orders.find((item) => item.code.toUpperCase() === code.toUpperCase());
  if (!order) return { ok: false, status: 404, error: "Pedido não encontrado." };
  if (order.status !== "concluido") return { ok: false, status: 409, error: "Avalie após a entrega do pedido." };
  if (order.rating !== undefined) return { ok: false, status: 409, error: "Este pedido já foi avaliado." };
  order.rating = rating;
  order.ratedAt = new Date().toISOString();
  return { ok: true, order };
}
