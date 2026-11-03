import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:\\Users\\Kawan\\.claude-mem\\claude-mem.db');
db.exec(`INSERT OR IGNORE INTO sdk_sessions
  (content_session_id, memory_session_id, project, platform_source, user_prompt, started_at, started_at_epoch, completed_at, completed_at_epoch, status, worker_port, prompt_counter, custom_title, observed_model, observed_billing, cwd, project_key_source)
VALUES
  ('sess-999-content', 'sess-999', 'projeto-delivery', 'opencode', 'test', datetime('now'), 1700000000, NULL, NULL, 'completed', NULL, 1, NULL, NULL, NULL, NULL, NULL)`);
console.log('Sessão inserida com todos os campos');
db.close();
