import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:\\Users\\Kawan\\.claude-mem\\claude-mem.db', { open: true, readOnly: true });
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables.map(t => t.name));
db.close();
