import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';

const DB_PATH = 'C:\\Users\\Kawan\\.claude-mem\\claude-mem.db';
const VAULT = 'Obsidian';

export function readObservations(dbPath = DB_PATH) {
  try {
    const db = new DatabaseSync(dbPath, { open: true, readOnly: true });
    const stmt = db.prepare('SELECT id, text FROM observations LIMIT 10');
    const rows = stmt.all();
    db.close();
    return rows.map(r => ({ id: r.id, text: r.text || '' }));
  } catch (e) {
    return [];
  }
}

export function classifySubject(text) {
  const lower = (text || '').toLowerCase();
  if (lower.includes('design') || lower.includes('desenho')) return 'design';
  if (lower.includes('bug') || lower.includes('erro')) return 'bugfix';
  if (lower.includes('chat') || lower.includes('conversa')) return 'chat';
  if (lower.includes('nota') || lower.includes('anotacao')) return 'anotacao';
  if (lower.includes('plano') || lower.includes('planejamento')) return 'planejamento';
  return 'geral';
}

export function generateNote(data) {
  const tags = `#opencode #claude-mem #sessao #${data.assunto}`;
  const yaml = `---\ntags: ${tags}\nresumo: ${data.resumo || ''}\ncontexto: [[contexto/${data.assunto || 'geral'}]]\nfonte: ${data.fonte || 'claude-mem'}\n---\n`;
  return yaml + `\n## Assunto: ${data.assunto || 'geral'}\n\n${data.text || ''}\n`;
}

export function findOrCreateContext(title, vault = VAULT) {
  const ctxDir = path.join(vault, 'contexto');
  if (!fs.existsSync(ctxDir)) fs.mkdirSync(ctxDir, { recursive: true });
  const fileName = `${title.replace(/[^a-zA-Z0-9]/g, '-')}.md`;
  const filePath = path.join(ctxDir, fileName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, `# Contexto: ${title}\n\nTags: #contexto\n`);
  }
  return `[[contexto/${fileName.replace('.md', '')}]]`;
}

export function runImport() {
  const rows = readObservations();
  for (const row of rows) {
    const assunto = classifySubject(row.text);
    const contextoLink = findOrCreateContext(assunto);
    const noteContent = generateNote({
      assunto,
      texto: row.text,
      resumo: row.text.slice(0, 200),
      contexto: contextoLink,
      fonte: 'claude-mem',
    });
    const fileName = `${new Date().toISOString().split('T')[0]}-${assunto}-${row.id}.canvas`;
    const canvasContent = JSON.stringify({
      nodes: [
        {
          id: `node-${row.id}`,
          x: 0,
          y: 0,
          width: 400,
          height: 200,
          type: 'text',
          text: `## Assunto: ${assunto}\n\n${row.text || ''}\n\nTags: #opencode #claude-mem #sessao #${assunto}\nResumo: ${(row.text || '').slice(0, 200)}\nContexto: [[contexto/${assunto || 'geral'}]]\nFonte: claude-mem`,
          color: '#7a7a7a',
        },
      ],
      edges: [],
    }, null, 2);
    const filePath = path.join(VAULT, fileName.replace('.md', '.canvas'));
    fs.writeFileSync(filePath, canvasContent);
  }
  return rows.length;
}
