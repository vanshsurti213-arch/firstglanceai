/**
 * FirstGlance AI - Server Entrypoint
 */

const http = require('node:http');
const createApp = require('./app');
const { config } = require('./config');

const app = createApp();
const server = typeof app === 'function' ? http.createServer(app) : app;

server.listen(config.service.port, config.service.host, () => {
  console.log(`[FirstGlance AI] Ingestion gateway active on http://${config.service.host}:${config.service.port}`);
  console.log(`[FirstGlance AI] Runtime Model: ${config.model.defaultModel} | Backend: ${config.model.backend}`);
  console.log(`[FirstGlance AI] Environment: ${config.env.toUpperCase()}`);
});

process.on('SIGTERM', () => {
  console.log('[FirstGlance AI] Received SIGTERM signal. Initiating graceful drain...');
  server.close(() => {
    console.log('[FirstGlance AI] HTTP listener closed cleanly.');
    process.exit(0);
  });
});
