const express = require('express');
const { database } = require('../config/database');

const router = express.Router();

// GET /api/tracks - List all active tracked products
router.get('/', async (req, res, next) => {
  try {
    const products = await database.getTrackedProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// POST /api/tracks - Add a new product to tracking list
router.post('/', async (req, res, next) => {
  try {
    const { store_product_id, product_name, selected_option } = req.body;

    if (!store_product_id || !product_name || !selected_option) {
      return res.status(400).json({
        error: 'Missing required fields: store_product_id, product_name, and selected_option are required.'
      });
    }

    const trackedProduct = await database.trackProduct(
      store_product_id,
      product_name,
      selected_option
    );

    res.status(201).json(trackedProduct);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/tracks/:id - Stop tracking a product
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await database.stopTracking(id);
    res.json({ message: 'Product tracking stopped successfully', product: updated });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
