/**
 * FirstGlance AI - Application Factory
 */

const { config } = require('./config');
const loggerMiddleware = require('./middleware/logger');
const authMiddleware = require('./middleware/auth');
const registerHealthRoutes = require('./routes/health');
const registerVisionRoutes = require('./routes/vision');

let express;
try {
  express = require('express');
} catch (_) {
  express = null;
}

function createApp() {
  if (express) {
    const app = express();
    app.use(express.json({ limit: '25mb' }));
    app.use(loggerMiddleware);
    app.use(authMiddleware);

    registerHealthRoutes(app);
    registerVisionRoutes(app);

    // Root info
    app.get('/', (req, res) => {
      res.json({
        service: config.service.name,
        version: config.service.version,
        documentation: 'https://github.com/vanshsurti213-arch/firstglanceai#readme',
        status: 'OPERATIONAL'
      });
    });

    return app;
  }

  // Zero-dependency fallback router for instant portability
  const http = require('node:http');
  const { validateDeploymentIntegrity } = require('./config');
  const { runVisionInference } = require('./services/inferenceEngine');
  const { listAvailableModels } = require('./services/modelRegistry');

  const handler = async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;
    
    // JSON response helper
    res.json = (data, statusCode = 200) => {
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    };
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };

    // Body parser
    let body = {};
    if (req.method === 'POST') {
      try {
        const buffers = [];
        for await (const chunk of req) buffers.push(chunk);
        const raw = Buffer.concat(buffers).toString();
        if (raw) body = JSON.parse(raw);
      } catch (_) {}
    }
    req.body = body;

    // Routing
    if (pathname === '/' && req.method === 'GET') {
      return res.json({
        service: config.service.name,
        version: config.service.version,
        documentation: 'https://github.com/vanshsurti213-arch/firstglanceai#readme',
        status: 'OPERATIONAL'
      });
    }

    if (pathname === '/health/live') {
      return res.json({ status: 'alive', uptime_seconds: process.uptime() });
    }

    if (pathname === '/health/ready') {
      const check = validateDeploymentIntegrity();
      if (!check.ready) {
        return res.json({
          status: 'UNAVAILABLE',
          message: 'Deployment integrity verification failed.',
          issues: check.issues
        }, 503);
      }
      return res.json({ status: 'READY', service: config.service.name });
    }

    if (pathname === '/v1/models' && req.method === 'GET') {
      return res.json({ status: 'success', count: 3, models: listAvailableModels() });
    }

    if (pathname === '/v1/vision/analyze' && req.method === 'POST') {
      if (!body.image && !body.image_url) {
        return res.json({ error: 'BAD_REQUEST', message: 'Missing required field "image"' }, 400);
      }
      const result = await runVisionInference(body);
      return res.json(result);
    }

    return res.json({ error: 'NOT_FOUND', path: pathname }, 404);
  };

  return handler;
}

module.exports = createApp;
