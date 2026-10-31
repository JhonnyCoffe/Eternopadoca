import type { Order, PaymentMethod, Settings } from "./types";
import { PAYMENT_LABEL } from "./types";
import { brl, onlyDigits } from "./format";

export function makeOrderCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

function paymentNote(payment: PaymentMethod, settings: Settings) {
  if (payment === "pix") {
    return `Pix${settings.pixKey ? ` — chave: ${settings.pixKey}` : ""}`;
  }
  return PAYMENT_LABEL[payment];
}

export function buildWhatsAppUrl(settings: Settings, order: Order): string {
  const lines: string[] = [];
  lines.push(`*Novo pedido #${order.code}*`);
  lines.push(`_${settings.storeName}_`);
  lines.push("");
  for (const item of order.items) {
    lines.push(`• ${item.qty}x ${item.name} — ${brl(item.price * item.qty)}`);
    if (item.notes) lines.push(`   ↳ obs: ${item.notes}`);
  }
  lines.push("");
  lines.push(`Subtotal: ${brl(order.subtotal)}`);
  if (order.type === "delivery") {
    lines.push(`Entrega: ${brl(order.deliveryFee)}`);
  }
  lines.push(`*Total: ${brl(order.total)}*`);
  lines.push("");
  lines.push(`Cliente: ${order.customerName}`);
  lines.push(`Telefone: ${order.customerPhone}`);
  lines.push(
    order.type === "delivery"
      ? `Entrega em: ${order.address}`
      : "Retirada na loja",
  );
  lines.push(`Pagamento: ${paymentNote(order.payment, settings)}`);
  if (order.notes) lines.push(`Observações: ${order.notes}`);

  const phone = onlyDigits(settings.whatsapp);
  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
}
