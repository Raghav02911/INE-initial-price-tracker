const express = require('express');
const { database } = require('../config/database');

const router = express.Router();

// GET /api/history/:productId?days=7
router.get('/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { days = 7 } = req.query;

    const records = await database.getPriceHistory(productId, parseInt(days, 10));
    res.json(records);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
