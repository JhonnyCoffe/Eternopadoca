import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('classifier', () => {
  it('classifica design', async () => {
    const { classifySubject } = await import('../scripts/classifier.mjs');
    assert.strictEqual(classifySubject('vamos refazer o design'), 'design');
  });
  it('classifica bugfix', async () => {
    const { classifySubject } = await import('../scripts/classifier.mjs');
    assert.strictEqual(classifySubject('bug no sistema'), 'bugfix');
  });
  it('fallback geral', async () => {
    const { classifySubject } = await import('../scripts/classifier.mjs');
    assert.strictEqual(classifySubject('qualquer texto'), 'geral');
  });
});
