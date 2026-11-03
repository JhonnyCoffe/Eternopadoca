import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:\\Users\\Kawan\\.claude-mem\\claude-mem.db', { open: true, readOnly: true });
const info = db.prepare("PRAGMA table_info(sdk_sessions)").all();
console.log(info.map(i => `${i.name}:${i.type}${i.notnull ? ' NOT NULL' : ''}`));
db.close();
