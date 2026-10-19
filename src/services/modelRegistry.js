/**
 * Model Registry & Weights Catalog
 */

const MODELS = {
  'firstglance-v2-nano': {
    name: 'FirstGlance v2 Nano',
    parameters: '8.4M',
    quantization: 'INT8',
    targetResolution: [384, 384],
    avgLatencyMs: 4.8,
    status: 'READY'
  },
  'firstglance-v2-core': {
    name: 'FirstGlance v2 Core (Default)',
    parameters: '34.2M',
    quantization: 'FP16',
    targetResolution: [640, 640],
    avgLatencyMs: 11.2,
    status: 'READY'
  },
  'firstglance-multimodal-large': {
    name: 'FirstGlance Multimodal Large',
    parameters: '112.5M',
    quantization: 'FP16',
    targetResolution: [1024, 1024],
    avgLatencyMs: 24.5,
    status: 'READY'
  }
};

function listAvailableModels() {
  return Object.entries(MODELS).map(([id, info]) => ({
    id,
    ...info
  }));
}

function getModelMetadata(modelId) {
  return MODELS[modelId] || MODELS['firstglance-v2-core'];
}

module.exports = {
  listAvailableModels,
  getModelMetadata
};
