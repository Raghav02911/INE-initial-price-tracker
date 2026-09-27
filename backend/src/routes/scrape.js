const express = require('express');
const { scrapeAllProducts } = require('../services/scrapeService');

const router = express.Router();

// POST /api/scrape/run-now (called by cron-job.org or manual trigger)
router.post('/run-now', async (req, res, next) => {
  try {
    const cronSecretHeader = req.headers['x-cron-secret'];
    const expectedSecret = process.env.CRON_SECRET;

    // Optional auth check for production cron security
    if (expectedSecret && cronSecretHeader && cronSecretHeader !== expectedSecret) {
      return res.status(401).json({ error: 'Unauthorized. Invalid X-Cron-Secret header.' });
    }

    const results = await scrapeAllProducts();
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      scraped_count: results.length,
      results
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
