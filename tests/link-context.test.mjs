import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';

describe('link-context', () => {
  it('cria contexto e retorna link', async () => {
    const { linkContext } = await import('../scripts/link-context.mjs');
    const result = linkContext('Novo Projeto');
    assert.strictEqual(result, '[[contexto/Novo-Projeto]]');
    assert.ok(fs.existsSync('Obsidian/contexto/Novo-Projeto.md'));
  });
});
