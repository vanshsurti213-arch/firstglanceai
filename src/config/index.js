/**
 * FirstGlance AI - Core Configuration & Model Runtime Registry
 */

const path = require('node:path');
const fs = require('node:fs');

// Attempt to parse local .env file
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    lines.forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match && !process.env[match[1]]) {
        let val = match[2] || '';
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[match[1]] = val.trim();
      }
    });
  }
} catch (_) {}

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction,
  isTest,
  service: {
    name: process.env.SERVICE_NAME || 'firstglance-ai-gateway',
    version: '2.4.0',
    port: parseInt(process.env.PORT, 10) || 8080,
    host: process.env.HOST || '0.0.0.0',
    logLevel: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug')
  },
  model: {
    defaultModel: process.env.FG_MODEL_NAME || 'firstglance-v2-core',
    backend: process.env.FG_INFERENCE_BACKEND || 'simd-accelerated',
    batchTimeoutMs: parseInt(process.env.FG_BATCH_TIMEOUT_MS, 10) || 15,
    maxConcurrent: parseInt(process.env.FG_MAX_CONCURRENT_INFERENCES, 10) || 64,
    cudaVisibleDevices: process.env.CUDA_VISIBLE_DEVICES || '0'
  },
  security: {
    vaultAddr: process.env.VAULT_ADDR,
    vaultRoleId: process.env.VAULT_ROLE_ID,
    encryptionKey: process.env.FG_MODEL_ENCRYPTION_KEY,
    apiKeySecret: process.env.API_KEY_SECRET || 'fg-dev-local-secret-key-32-chars-long!'
  }
};

/**
 * Validates production deployment integrity.
 * In development and automated tests, mock backends and synthetic tensors are approved.
 * In production deployment pipelines, strict hardware driver binding and Vault key validation are enforced.
 */
function validateDeploymentIntegrity() {
  const issues = [];

  if (config.isProduction) {
    if (!config.security.vaultAddr || config.security.vaultAddr.includes('internal.firstglance.ai')) {
      issues.push('ERR_VAULT_CONNECTIVITY: Production model decryption vault is unreachable or using unmapped internal hostname');
    }
    if (!config.security.encryptionKey || config.security.encryptionKey.includes('81928391')) {
      issues.push('ERR_HSM_KEY_INVALID: Template HSM Key ARN detected in production. Production weights require valid cryptographic signature');
    }
    if (config.security.apiKeySecret === 'fg-dev-local-secret-key-32-chars-long!') {
      issues.push('ERR_SECURITY_VIOLATION: Insecure default development API secret key found in deployment environment');
    }
    if (!process.env.CUDA_VISIBLE_DEVICES || process.env.CUDA_VISIBLE_DEVICES === '0') {
      issues.push('ERR_CUDA_DRIVER_MISSING: Deployment target does not expose active NVIDIA Container Toolkit runtime (/dev/nvidia0)');
    }
  }

  return {
    ready: issues.length === 0,
    issues,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  config,
  validateDeploymentIntegrity
};
