import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:\\Users\\Kawan\\.claude-mem\\claude-mem.db');
db.exec(`INSERT INTO observations
  (id, memory_session_id, project, text, type, title, subtitle, facts, narrative, concepts, files_read, files_modified, prompt_number, created_at, created_at_epoch, discovery_tokens, content_hash, generated_by_model, relevance_count, merged_into_project, agent_type, agent_id, metadata, synced_at, origin_device_id, origin_local_id, sync_rev, occurrence_count, title_norm_key, reinforcement_dates, last_reinforced)
VALUES
  (9999, 'sess-999', 'projeto-delivery', 'Design do sistema de entrega em tempo real com rastreamento GPS', 'annotation', 'Design delivery', 'GPS tracking', 'rastreamento em tempo real', 'sistema funciona', 'delivery', NULL, NULL, 1, datetime('now'), 1700000000, 0, 'hash1', 'model-test', 1, NULL, 'user', 'agent-1', '{}', NULL, NULL, NULL, '1', 1, NULL, NULL, NULL)`);
console.log('Observação inserida com conteúdo real');
db.close();
