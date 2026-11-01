import type { DeliveryLocation } from "./types";
import { openSqliteDb } from "./sqlite";

function db() {
  return openSqliteDb();
}

export function isValidLocationPayload(input: unknown): boolean {
  if (!input || typeof input !== "object") return false;
  const i = input as Record<string, unknown>;
  const lat = i.latitude;
  const lng = i.longitude;
  if (typeof lat !== "number" || typeof lng !== "number") return false;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
  return true;
}

export async function getDeliveryLocation(orderId: string): Promise<DeliveryLocation | null> {
  const store = db();
  try {
    const row = store.db.prepare("SELECT order_id, latitude, longitude, accuracy, heading, speed, updated_at FROM order_locations WHERE order_id = ?").get(orderId) as
      | { order_id: string; latitude: number; longitude: number; accuracy?: number; heading?: number; speed?: number; updated_at: string }
      | undefined;
    if (!row) return null;
    return {
      orderId: row.order_id,
      latitude: row.latitude,
      longitude: row.longitude,
      accuracy: row.accuracy ?? undefined,
      heading: row.heading ?? undefined,
      speed: row.speed ?? undefined,
      updatedAt: row.updated_at,
    };
  } finally {
    store.close();
  }
}

export async function saveDeliveryLocation(location: DeliveryLocation): Promise<void> {
  const store = db();
  try {
    store.db.prepare("INSERT OR REPLACE INTO order_locations (order_id, latitude, longitude, accuracy, heading, speed, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
      location.orderId,
      location.latitude,
      location.longitude,
      location.accuracy ?? null,
      location.heading ?? null,
      location.speed ?? null,
      location.updatedAt
    );
  } finally {
    store.close();
  }
}

export async function clearDeliveryLocation(orderId: string): Promise<void> {
  const store = db();
  try {
    store.db.prepare("DELETE FROM order_locations WHERE order_id = ?").run(orderId);
  } finally {
    store.close();
  }
}
