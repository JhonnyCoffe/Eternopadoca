import fs from 'fs';
import path from 'path';

const VAULT = 'Obsidian';

export function onMessage(event) {
  const text = (event && event.text) || '';
  if (!text) return;
  // Classifica por palavra-chave simples
  const assunto = classifySubject(text);
  const contextoLink = findOrCreateContext(assunto);
  const fileName = `${new Date().toISOString().split('T')[0]}-${assunto}-${Date.now()}.canvas`;
  const canvasContent = JSON.stringify({
    nodes: [{ id: `live-${Date.now()}`, x: 0, y: 0, width: 400, height: 200, type: 'text', text: `## ${assunto}\n\n${text}\nTags: #opencode #claude-mem #sessao #${assunto}`, color: '#7a7a7a' }],
    edges: [],
  }, null, 2);
  fs.writeFileSync(path.join(VAULT, fileName), canvasContent);
}

function classifySubject(text) {
  const lower = text.toLowerCase();
  if (lower.includes('design')) return 'design';
  if (lower.includes('bug')) return 'bugfix';
  if (lower.includes('chat')) return 'chat';
  if (lower.includes('nota')) return 'anotacao';
  if (lower.includes('plano')) return 'planejamento';
  return 'geral';
}

function findOrCreateContext(title) {
  const ctxDir = path.join(VAULT, 'contexto');
  if (!fs.existsSync(ctxDir)) fs.mkdirSync(ctxDir, { recursive: true });
  const fileName = `${title.replace(/[^a-zA-Z0-9]/g, '-')}.md`;
  const filePath = path.join(ctxDir, fileName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, `# Contexto: ${title}\n\nTags: #contexto\n`);
  }
  return `[[contexto/${fileName.replace('.md', '')}]]`;
}

function generateNote(data) {
  const tags = `#opencode #claude-mem #sessao #${data.assunto}`;
  const yaml = `---\ntags: ${tags}\nresumo: ${data.resumo || ''}\ncontexto: ${data.contexto || ''}\nfonte: ${data.fonte || 'plugin-live'}\n---\n`;
  return yaml + `\n## Assunto: ${data.assunto || 'geral'}\n\n${data.texto || ''}\n`;
}
