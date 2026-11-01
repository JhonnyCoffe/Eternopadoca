import fs from 'fs';
import path from 'path';

const VAULT = 'Obsidian';

export function linkContext(title, vault = VAULT) {
  const ctxDir = path.join(vault, 'contexto');
  if (!fs.existsSync(ctxDir)) fs.mkdirSync(ctxDir, { recursive: true });
  const safe = title.replace(/[^a-zA-Z0-9]/g, '-');
  const fileName = `${safe}.md`;
  const filePath = path.join(ctxDir, fileName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, `# Contexto: ${title}\n\nTags: #contexto\n`);
  }
  const linkName = fileName.replace('.md', '');
  return `[[contexto/${linkName}]]`;
}
