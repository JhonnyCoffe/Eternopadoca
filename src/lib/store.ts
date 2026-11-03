import { openSqliteDb, initializeSqlite } from "./sqlite";

export type Store = {
  id: string;
  subdomain: string;
  name: string;
  active: boolean;
  createdAt: string;
};

export function getStores() {
  const store = openSqliteDb();
  initializeSqlite(store);
  const rows = store.db.prepare("SELECT id, subdomain, name, active, created_at FROM stores WHERE active = 1").all() as Array<{ id: string; subdomain: string; name: string; active: number; created_at: string }>;
  store.close();
  return rows.map((r) => ({ id: r.id, subdomain: r.subdomain, name: r.name, active: !!r.active, createdAt: r.created_at }));
}

export function getStoreBySubdomain(subdomain: string) {
  const store = openSqliteDb();
  initializeSqlite(store);
  const row = store.db.prepare("SELECT id, subdomain, name, active, created_at FROM stores WHERE subdomain = ? AND active = 1").get(subdomain) as { id: string; subdomain: string; name: string; active: number; created_at: string } | undefined;
  store.close();
  return row ? { id: row.id, subdomain: row.subdomain, name: row.name, active: !!row.active, createdAt: row.created_at } : undefined;
}
