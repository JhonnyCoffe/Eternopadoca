export function applyCoupon(code: string, subtotal: number): { ok: boolean; discount: number; code: string } {
  const coupons: Record<string, number> = { PROMO10: 0.1, BRASA20: 0.2 };
  const pct = coupons[code.toUpperCase()] ?? 0;
  return { ok: pct > 0, discount: Math.round(subtotal * pct * 100) / 100, code };
}
