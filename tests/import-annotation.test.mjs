// Teste simples: verifica se o script pode ser carregado e se a função de importação existe
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('import-annotation', () => {
  it('deve exportar readObservations', async () => {
    const mod = await import('../scripts/import-annotation.mjs');
    assert.strictEqual(typeof mod.readObservations, 'function');
  });
});
