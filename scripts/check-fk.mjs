import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:\\Users\\Kawan\\.claude-mem\\claude-mem.db', { open: true, readOnly: true });
const fk = db.prepare("PRAGMA foreign_key_list(observations)").all();
console.log('FKs:', fk);
db.close();
