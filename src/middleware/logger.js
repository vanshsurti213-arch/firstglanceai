/**
 * Structured request logger for FirstGlance AI
 */

function loggerMiddleware(req, res, next) {
  const startTime = process.hrtime.bigint();
  const requestId = `fg-${Math.random().toString(36).substring(2, 9)}`;
  
  res.setHeader('X-Request-Id', requestId);
  res.setHeader('X-Powered-By', 'FirstGlance-Inference-Engine');

  res.on('finish', () => {
    const elapsedMs = Number(process.hrtime.bigint() - startTime) / 1e6;
    if (process.env.NODE_ENV !== 'test') {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        request_id: requestId,
        method: req.method,
        path: req.url,
        status: res.statusCode,
        duration_ms: elapsedMs.toFixed(2)
      }));
    }
  });

  next();
}

module.exports = loggerMiddleware;
