import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:\\Users\\Kawan\\.claude-mem\\claude-mem.db', { open: true, readOnly: true });
const info = db.prepare("PRAGMA table_info(observations)").all();
console.log(info.map(i => `${i.name}:${i.type}${i.notnull ? ' NOT NULL' : ''}${i.dflt_value ? ' DEFAULT ' + i.dflt_value : ''}`));
db.close();
