import type {
  DeliveryZone,
  Order,
  OrderStatus,
  PaymentMethod,
  Product,
  Settings,
  Weekday,
} from "./types";

const TZ = "America/Sao_Paulo";

const WEEKDAY_INDEX: Record<string, Weekday> = {
  Sun: "0",
  Mon: "1",
  Tue: "2",
  Wed: "3",
  Thu: "4",
  Fri: "5",
  Sat: "6",
};

function minutesOf(time: string): number {
  const [h, m] = time.split(":").map((n) => Number(n));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return h * 60 + m;
}

export function storeClock(date = new Date()): {
  weekday: Weekday;
  minutes: number;
  label: string;
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekday = WEEKDAY_INDEX[get("weekday")] ?? "0";
  const hour = Number(get("hour")) % 24;
  const minute = Number(get("minute"));
  const minutes = hour * 60 + minute;

  return {
    weekday,
    minutes,
    label: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
  };
}

export function isStoreOpen(settings: Settings, date = new Date()): boolean {
  if (!settings.autoHours) return settings.isOpen;

  const { weekday, minutes } = storeClock(date);
  const day = settings.hours?.[weekday];
  if (!day || day.closed) return false;

  const open = minutesOf(day.open);
  const close = minutesOf(day.close);

  if (close > open) return minutes >= open && minutes < close;
  // fecha depois da meia-noite (ex.: 18:00 → 00:30)
  return minutes >= open || minutes < close;
}

export function storeStatus(settings: Settings): {
  open: boolean;
  label: string;
} {
  const open = isStoreOpen(settings);
  if (!settings.autoHours) {
    return { open, label: open ? "Aberto agora" : "Fechado" };
  }
  const { weekday } = storeClock();
  const day = settings.hours?.[weekday];
  if (open) {
    return { open, label: `Aberto até ${day?.close ?? ""}` };
  }
  return { open, label: day?.closed ? "Fechado hoje" : `Abre às ${day?.open ?? ""}` };
}

export function activeZones(settings: Settings): DeliveryZone[] {
  return (settings.deliveryZones ?? []).filter((z) => z.active);
}

export function zoneFee(settings: Settings, zoneId?: string): number {
  const zone = activeZones(settings).find((z) => z.id === zoneId);
  if (zone) return zone.fee;
  return settings.deliveryFee;
}

export function availableStock(product: Product): number | null {
  if (!product.trackStock) return null;
  return Math.max(0, product.stock ?? 0);
}

export function isSoldOut(product: Product): boolean {
  const stock = availableStock(product);
  return stock !== null && stock <= 0;
}

export function isLowStock(product: Product): boolean {
  const stock = availableStock(product);
  if (stock === null) return false;
  return stock <= (product.lowStockAt ?? 5);
}

export function orderCost(order: Order): number {
  return order.items.reduce(
    (acc, item) => acc + (item.cost ?? 0) * item.qty,
    0,
  );
}

export const STATUS_FLOW: OrderStatus[] = [
  "novo",
  "preparando",
  "pronto",
  "saiu",
  "concluido",
];

export function statusStep(status: OrderStatus): number {
  const index = STATUS_FLOW.indexOf(status);
  return index < 0 ? 0 : index;
}

export function paymentNeedsChange(payment: PaymentMethod): boolean {
  return payment === "dinheiro";
}
