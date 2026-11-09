import type { DeliveryLocation } from "./types";
import { openSqliteDb, initializeSqlite, type SqliteStore } from "./sqlite";
import type { Database } from "sqlite3";

async function withDb<T>(fn: (db: Database) => Promise<T>): Promise<T> {
  const store: SqliteStore = openSqliteDb();
  try {
    await initializeSqlite(store);
    return await fn(store.db);
  } finally {
    try { store.close(); } catch { /* noop */ }
  }
}

function run(db: Database, sql: string, params: unknown[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err: Error | null) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

function get<T>(db: Database, sql: string, params: unknown[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err: Error | null, row: T | undefined) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

export function isValidLocationPayload(input: unknown): boolean {
  if (!input || typeof input !== "object") return false;
  const i = input as Record<string, unknown>;
  const lat = i.latitude;
  const lng = i.longitude;
  if (typeof lat !== "number" || typeof lng !== "number") return false;
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  return true;
}

export async function getDeliveryLocation(orderId: string): Promise<DeliveryLocation | null> {
  return withDb(async (db) => {
    const row = await get<{ order_id: string; latitude: number; longitude: number; accuracy?: number; heading?: number; speed?: number; updated_at: string }>(
      db,
      "SELECT order_id, latitude, longitude, accuracy, heading, speed, updated_at FROM order_locations WHERE order_id = ?",
      [orderId]
    );
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
  });
}

export async function saveDeliveryLocation(location: DeliveryLocation): Promise<void> {
  return withDb(async (db) => {
    await run(
      db,
      "INSERT OR REPLACE INTO order_locations (order_id, latitude, longitude, accuracy, heading, speed, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        location.orderId,
        location.latitude,
        location.longitude,
        location.accuracy ?? null,
        location.heading ?? null,
        location.speed ?? null,
        location.updatedAt,
      ]
    );
  });
}

export async function clearDeliveryLocation(orderId: string): Promise<void> {
  return withDb(async (db) => {
    await run(db, "DELETE FROM order_locations WHERE order_id = ?", [orderId]);
  });
}
