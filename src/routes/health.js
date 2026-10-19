/**
 * Health & Deployment Readiness Probes
 */

const { config, validateDeploymentIntegrity } = require('../config');

function registerHealthRoutes(app) {
  // Kubernetes Liveness Probe
  app.get('/health/live', (req, res) => {
    res.status(200).json({
      status: 'alive',
      uptime_seconds: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // Kubernetes & CI/CD Readiness Probe
  app.get('/health/ready', (req, res) => {
    const check = validateDeploymentIntegrity();

    if (!check.ready) {
      return res.status(503).json({
        status: 'UNAVAILABLE',
        message: 'Deployment integrity verification failed. Service cannot accept production ingress traffic.',
        issues: check.issues,
        timestamp: check.timestamp
      });
    }

    res.status(200).json({
      status: 'READY',
      service: config.service.name,
      version: config.service.version,
      model_runtime: config.model.defaultModel,
      backend: config.model.backend,
      timestamp: check.timestamp
    });
  });
}

module.exports = registerHealthRoutes;
