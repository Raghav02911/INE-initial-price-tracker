const express = require('express');
const { generateScrapeHistoryCSV } = require('../services/csvService');

const router = express.Router();

// GET /api/export/csv - Export all scrape records as downloadable CSV
router.get('/csv', async (req, res, next) => {
  try {
    const csvContent = await generateScrapeHistoryCSV();
    const dateStr = new Date().toISOString().split('T')[0];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="scrape_history_${dateStr}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
