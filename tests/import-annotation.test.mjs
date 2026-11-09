// Teste simples: verifica se o script pode ser carregado e se a função de importação existe
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('import-annotation', () => {
  it('deve exportar readObservations', async () => {
    const mod = await import('../scripts/import-annotation.mjs');
    assert.strictEqual(typeof mod.readObservations, 'function');
  });
  it('deve criar arquivo .canvas', async () => {
    const fs = await import('fs');
    const mod = await import('../scripts/import-annotation.mjs');
    const count = mod.runImport();
    assert.strictEqual(count > 0, true);
    const files = fs.readdirSync('Obsidian').filter(f => f.endsWith('.canvas'));
    assert.strictEqual(files.length > 0, true);
  });
});
