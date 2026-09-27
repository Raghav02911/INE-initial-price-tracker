const { database } = require('../config/database');
const { scrapeProduct } = require('../scrapers/scraper');

async function scrapeAllProducts(isHeaded = false) {
  try {
    const products = await database.getTrackedProducts();

    if (!products || products.length === 0) {
      console.log('ℹ️ No active products found to scrape.');
      return [];
    }

    console.log(`🚀 Starting batch scrape for ${products.length} product(s)...`);
    const results = [];

    for (const product of products) {
      console.log(`\n----------------------------------------`);
      console.log(`▶ Scraping Product ID ${product.id}: ${product.product_name} (${product.selected_option})`);
      const result = await scrapeProduct(product, 3, isHeaded);
      results.push({
        product_id: product.id,
        product_name: product.product_name,
        selected_option: product.selected_option,
        ...result
      });
    }

    console.log(`\n✅ Batch scrape completed for ${products.length} product(s).`);
    return results;
  } catch (error) {
    console.error('Batch scrape execution error:', error);
    throw error;
  }
}

module.exports = { scrapeAllProducts };
