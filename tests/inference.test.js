const test = require('node:test');
const assert = require('node:assert');
const { runVisionInference } = require('../src/services/inferenceEngine');

test('Vision Inference Pipeline Suite', async (t) => {
  await t.test('Executes vision inference with bounding box detection', async () => {
    const payload = {
      image: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
      confidence_threshold: 0.5,
      features: ['objects', 'scene_tags', 'perceptual_score']
    };

    const result = await runVisionInference(payload);

    assert.strictEqual(result.status, 'success');
    assert.strictEqual(result.model_version, 'firstglance-v2-core');
    assert.ok(result.inference_time_ms > 0);
    assert.ok(Array.isArray(result.detections));
    assert.ok(Array.isArray(result.scene_tags));
    assert.strictEqual(typeof result.perceptual_quality_score, 'number');
  });

  await t.test('Filters detections below confidence threshold', async () => {
    const payload = {
      image: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
      confidence_threshold: 0.999
    };

    const result = await runVisionInference(payload);
    assert.strictEqual(result.status, 'success');
    // High threshold should yield 0 or few items
    assert.ok(result.detections.length <= 1);
  });
});
