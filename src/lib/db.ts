import { promises as fs } from "fs";
import fsSync from "fs";
import path from "path";
import type { Db, DayHours, Weekday } from "./types";
import { seedDb, createOwner, createKawan } from "./seed";
import { openSqliteDb, initializeSqlite, readSqliteDb, writeSqliteDb, importJsonIfEmpty } from "./sqlite";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");
const SQLITE_PATH = process.env.SQLITE_PATH || path.join(DATA_DIR, "app.sqlite");
const USE_SQLITE = process.env.DB_DRIVER === "sqlite";

const DEFAULT_DAY: DayHours = { closed: false, open: "18:00", close: "23:30" };

function defaultHours(): Record<Weekday, DayHours> {
  return {
    "0": { ...DEFAULT_DAY },
    "1": { ...DEFAULT_DAY },
    "2": { ...DEFAULT_DAY },
    "3": { ...DEFAULT_DAY },
    "4": { ...DEFAULT_DAY },
    "5": { ...DEFAULT_DAY },
    "6": { ...DEFAULT_DAY },
  };
}

/**
 * Garante que dados antigos (sem usuários, horários, zonas etc.) continuem
 * funcionando depois de uma atualização.
 */
export function normalizeDb(raw: Db): Db {
  const db = raw as Db;

  db.categories ??= [];
  db.products ??= [];
  db.orders ??= [];
  db.users ??= [];
  db.messages ??= [];

  // Banco criado antes da gestão de equipe: garante o dono, senão o login
  // do painel fica impossível.
  if (db.users.length === 0) db.users.push(createOwner());

  // Garante o usuário Kawan (cria se não existir, preservando bancos existentes)
  if (!db.users.some((u) => u.username === "kawan")) {
    db.users.push(createKawan());
  }

  const currentSettings = db.settings ?? ({} as Db["settings"]);
  db.settings = {
    ...currentSettings,
    autoHours: currentSettings.autoHours ?? false,
    hours: { ...defaultHours(), ...(currentSettings.hours ?? {}) },
    deliveryZones: currentSettings.deliveryZones ?? [],
  };

  for (const product of db.products) {
    product.trackStock = product.trackStock ?? false;
    product.stock = product.stock ?? 0;
    product.cost = product.cost ?? 0;
    product.lowStockAt = product.lowStockAt ?? 5;
    product.position = Number.isFinite(product.position) ? product.position : 0;
  }

  for (const order of db.orders) {
    order.paymentStatus = order.paymentStatus ?? "pendente";
    for (const item of order.items) {
      if (item.cost === undefined) {
        const product = db.products.find((p) => p.id === item.productId);
        item.cost = product?.cost ?? 0;
      }
    }
  }

  return db;
}

/**
 * Fila de escrita: evita que duas requisições simultâneas sobrescrevam o
 * arquivo uma da outra. Vive no globalThis porque o Next pode recarregar
 * módulos em desenvolvimento.
 */
const globalForDb = globalThis as unknown as {
  __dbQueue?: Promise<void>;
};

async function withWriteLock<T>(fn: () => Promise<T>): Promise<T> {
  const previous = globalForDb.__dbQueue ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => {
    release = resolve;
  });
  globalForDb.__dbQueue = previous.then(() => current);

  await previous;
  try {
    return await fn();
  } finally {
    release();
  }
}

async function readFile(): Promise<string | null> {
  try {
    return await fs.readFile(DB_PATH, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

async function writeFile(content: string): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${DB_PATH}.tmp`;
  await fs.writeFile(tmp, content, "utf8");
  // No Windows o rename pode falhar se o antivírus estiver lendo o arquivo.
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await fs.rename(tmp, DB_PATH);
      return;
    } catch (error) {
      if (attempt === 4) throw error;
      await new Promise((r) => setTimeout(r, 40));
    }
  }
}

/**
 * Lê sempre do arquivo: em desenvolvimento as rotas do Next podem rodar em
 * contextos separados, então cache em memória causaria dados desatualizados.
 */
let sqliteStore: ReturnType<typeof openSqliteDb> | null = null;

async function getSqliteStore() {
  fsSync.mkdirSync(DATA_DIR, { recursive: true });
  sqliteStore ??= openSqliteDb(SQLITE_PATH);
  await initializeSqlite(sqliteStore);
  return sqliteStore;
}

export async function getDb(): Promise<Db> {
  if (USE_SQLITE) {
    const store = await getSqliteStore();
    const current = await readSqliteDb(store);
    if (current.settings?.storeName && current.products.length > 0 && current.users.length > 0) return normalizeDb(current);
    const raw = await readFile();
    const source = raw === null ? seedDb() : JSON.parse(raw.replace(/^\uFEFF/, "")) as Db;
    await importJsonIfEmpty(store, normalizeDb(source));
    return normalizeDb(await readSqliteDb(store));
  }

  const raw = await readFile();
  if (raw === null) {
    const seeded = seedDb();
    await writeFile(JSON.stringify(seeded, null, 2));
    return seeded;
  }
  return normalizeDb(JSON.parse(raw.replace(/^\uFEFF/, "")) as Db);
}

export async function saveDb(db: Db): Promise<void> {
  await withWriteLock(async () => {
    if (USE_SQLITE) {
      await writeSqliteDb(await getSqliteStore(), normalizeDb(db));
      return;
    }
    await writeFile(JSON.stringify(db, null, 2));
  });
}

export async function mutateDb<T>(fn: (db: Db) => T | Promise<T>): Promise<T> {
  return withWriteLock(async () => {
    const db = await getDb();
    const result = await fn(db);
    if (USE_SQLITE) await writeSqliteDb(await getSqliteStore(), normalizeDb(db));
    else await writeFile(JSON.stringify(db, null, 2));
    return result;
  });
}
