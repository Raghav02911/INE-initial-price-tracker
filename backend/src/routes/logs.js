const express = require('express');
const { database } = require('../config/database');

const router = express.Router();

// GET /api/logs/:productId?limit=50
router.get('/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { limit = 50 } = req.query;

    const logs = await database.getScrapeLogs(productId, parseInt(limit, 10));
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
