const test = require('node:test');
const assert = require('node:assert');
const { config, validateDeploymentIntegrity } = require('../src/config');
const { listAvailableModels } = require('../src/services/modelRegistry');

test('Health & Configuration Suite', async (t) => {
  await t.test('Configuration defaults load correctly', () => {
    assert.strictEqual(config.service.name, 'firstglance-ai-gateway');
    assert.strictEqual(config.service.version, '2.4.0');
    assert.ok(config.service.port > 0);
  });

  await t.test('Model registry lists all default production models', () => {
    const models = listAvailableModels();
    assert.strictEqual(models.length, 3);
    assert.ok(models.some(m => m.id === 'firstglance-v2-core'));
  });

  await t.test('Development/Test mode readiness probe passes', () => {
    // In test environment, mock dependencies are approved
    const check = validateDeploymentIntegrity();
    assert.strictEqual(check.ready, true);
    assert.strictEqual(check.issues.length, 0);
  });
});
