import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:\\Users\\Kawan\\.claude-mem\\claude-mem.db', { open: true, readOnly: true });
const sessions = db.prepare("SELECT memory_session_id FROM sdk_sessions LIMIT 5").all();
console.log('Sessions:', sessions);
db.close();
