import { openSqliteDb, initializeSqlite } from "./sqlite.cjs";

type StoreRow = { id: string; subdomain: string; name: string; active: number; created_at: string };

function all(db: any, sql: string, params: unknown[] = []): Promise<StoreRow[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err: Error | null, rows: StoreRow[]) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

function get(db: any, sql: string, params: unknown[] = []): Promise<StoreRow | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err: Error | null, row: StoreRow | undefined) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

export async function getStores() {
  const store: any = openSqliteDb();
  try {
    await initializeSqlite(store);
    const rows = await all(store.db, "SELECT id, subdomain, name, active, created_at FROM stores WHERE active = 1");
    return rows.map((r) => ({ id: r.id, subdomain: r.subdomain, name: r.name, active: !!r.active, createdAt: r.created_at }));
  } finally {
    store.close();
  }
}

export async function getStoreBySubdomain(subdomain: string) {
  const store: any = openSqliteDb();
  try {
    await initializeSqlite(store);
    const row = await get(store.db, "SELECT id, subdomain, name, active, created_at FROM stores WHERE subdomain = ? AND active = 1", [subdomain]);
    return row ? { id: row.id, subdomain: row.subdomain, name: row.name, active: !!row.active, createdAt: row.created_at } : undefined;
  } finally {
    store.close();
  }
}
