import type {
  Db,
  Order,
  OrderItem,
  OrderType,
  PaymentMethod,
} from "./types";
import { onlyDigits } from "./format";
import { makeOrderCode } from "./whatsapp";
import { zoneFee } from "./store";

export type CreateOrderInput = {
  items?: { productId?: string; qty?: number }[];
  customerName?: string;
  customerPhone?: string;
  type?: OrderType;
  address?: string;
  payment?: PaymentMethod;
  notes?: string;
  zoneId?: string;
  /** LGPD: aceite dos termos e política de privacidade */
  termsAccepted?: boolean;
  termsVersion?: string;
  /** LGPD: consentimento separado para marketing (opt-in) */
  marketingConsent?: boolean;
  /** LGPD: IP do cliente no momento do aceite */
  termsIp?: string;
};

export type CreateOrderResult =
  | { ok: true; order: Order }
  | { ok: false; error: string; status: number };

const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

/**
 * Valida e monta o pedido. Não salva: quem chama decide quando persistir
 * (assim a baixa de estoque acontece na mesma gravação).
 */
export function buildOrder(db: Db, body: CreateOrderInput): CreateOrderResult {
  const incomingItems = Array.isArray(body.items) ? body.items : [];
  if (incomingItems.length === 0) {
    return { ok: false, error: "Seu carrinho está vazio.", status: 400 };
  }

  const items: OrderItem[] = [];
  const requiredStock = new Map<string, number>();

  for (const incoming of incomingItems) {
    const product = db.products.find(
      (p) => p.id === incoming.productId && p.active,
    );
    const qty = Math.floor(Number(incoming.qty ?? 0));
    if (!product || !Number.isFinite(qty) || qty < 1 || qty > 50) {
      return {
        ok: false,
        error: "Um dos itens não está mais disponível.",
        status: 400,
      };
    }

    if (product.trackStock) {
      const needed = (requiredStock.get(product.id) ?? 0) + qty;
      requiredStock.set(product.id, needed);
      if (needed > Math.max(0, product.stock ?? 0)) {
        return {
          ok: false,
          error: `Acabou o estoque de ${product.name}.`,
          status: 409,
        };
      }
    }

    items.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      qty,
      cost: product.cost ?? 0,
    });
  }

  const subtotal = items.reduce((acc, it) => acc + it.price * it.qty, 0);
  if (subtotal < db.settings.minOrder) {
    return {
      ok: false,
      error: `O pedido mínimo é de ${brl(db.settings.minOrder)}.`,
      status: 400,
    };
  }

  const customerName = String(body.customerName ?? "").trim();
  const customerPhone = onlyDigits(String(body.customerPhone ?? ""));
  const type: OrderType = body.type === "retirada" ? "retirada" : "delivery";
  const payment: PaymentMethod =
    body.payment === "dinheiro" ||
    body.payment === "cartao" ||
    body.payment === "vr"
      ? body.payment
      : "pix";
  const address = String(body.address ?? "").trim();
  const notes = String(body.notes ?? "").trim().slice(0, 500);
  const zoneId = body.zoneId ? String(body.zoneId) : undefined;
  const termsAccepted = Boolean(body.termsAccepted);
  const termsVersion = body.termsVersion ? String(body.termsVersion) : undefined;
  const marketingConsent = Boolean(body.marketingConsent);
  const termsIp = body.termsIp ? String(body.termsIp) : undefined;

  if (customerName.length < 2) {
    return { ok: false, error: "Informe seu nome completo.", status: 400 };
  }
  if (customerPhone.length < 10) {
    return {
      ok: false,
      error: "Informe um WhatsApp válido com DDD.",
      status: 400,
    };
  }
  if (!termsAccepted) {
    return {
      ok: false,
      error: "Você precisa aceitar os Termos de Uso e a Política de Privacidade para continuar.",
      status: 400,
    };
  }
  if (type === "delivery" && address.length < 8) {
    return {
      ok: false,
      error: "Informe o endereço completo para entrega.",
      status: 400,
    };
  }

  const zone = (db.settings.deliveryZones ?? []).find(
    (z) => z.id === zoneId && z.active,
  );
  const deliveryFee =
    type === "delivery" ? zoneFee(db.settings, zoneId) : 0;

  let code = makeOrderCode();
  while (db.orders.some((o) => o.code === code)) {
    code = makeOrderCode();
  }

  const order: Order = {
    id: crypto.randomUUID(),
    code,
    createdAt: new Date().toISOString(),
    customerName,
    customerPhone,
    type,
    address: type === "delivery" ? address : undefined,
    notes: notes || undefined,
    items,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    payment,
    paymentStatus: "pendente",
    status: "novo",
    zoneId: type === "delivery" ? zone?.id : undefined,
    zoneName: type === "delivery" ? zone?.name : undefined,
    termsAccepted,
    termsVersion,
    termsAcceptedAt: termsAccepted ? new Date().toISOString() : undefined,
    termsIp,
    marketingConsent,
  };

  // Baixa de estoque junto com o pedido
  for (const [productId, qty] of requiredStock) {
    const product = db.products.find((p) => p.id === productId);
    if (!product) continue;
    product.stock = Math.max(0, (product.stock ?? 0) - qty);
  }

  return { ok: true, order };
}

export function mapsRouteUrl(address: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    address,
  )}`;
}

export function mapsSearchUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address,
  )}`;
}
