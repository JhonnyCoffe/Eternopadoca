import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('plugin/live-capture', () => {
  it('deve exportar onMessage', async () => {
    const mod = await import('../plugin/live-capture.mjs');
    assert.strictEqual(typeof mod.onMessage, 'function');
  });
});
