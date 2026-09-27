const express = require('express');
const { searchProducts } = require('../services/productService');

const router = express.Router();

// GET /api/search?query=laptop
router.get('/', async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 1) {
      return res.status(400).json({ error: 'Search query parameter is required' });
    }

    const products = await searchProducts(query);
    res.json(products);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
