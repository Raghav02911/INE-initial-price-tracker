function errorHandler(err, req, res, next) {
  console.error('[API Error]:', err.stack || err.message || err);

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
}

module.exports = errorHandler;
