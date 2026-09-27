const express = require('express');
const cors = require('cors');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const searchRoutes = require('./routes/search');
const tracksRoutes = require('./routes/tracks');
const scrapeRoutes = require('./routes/scrape');
const historyRoutes = require('./routes/history');
const logsRoutes = require('./routes/logs');
const exportRoutes = require('./routes/export');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(logger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'INE Price Tracker Backend',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/search', searchRoutes);
app.use('/api/tracks', tracksRoutes);
app.use('/api/scrape', scrapeRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/export', exportRoutes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;
