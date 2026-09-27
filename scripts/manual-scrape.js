const path = require('path');
const dotenv = require(path.resolve(__dirname, '../backend/node_modules/dotenv'));
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const { initializeDatabase } = require('../backend/src/config/database');
const { scrapeAllProducts } = require('../backend/src/services/scrapeService');

async function runManualHeadedScrape() {
  console.log('==================================================');
  console.log('🎥 Starting Headed Scraper Mode (Visible Browser)...');
  console.log('==================================================');

  try {
    await initializeDatabase();
    const results = await scrapeAllProducts(true); // Pass true for isHeaded

    console.log('\n==================================================');
    console.log(`✅ Headed Scrape Complete! Total Scraped: ${results.length}`);
    console.log('==================================================');
    process.exit(0);
  } catch (error) {
    console.error('❌ Headed scrape error:', error);
    process.exit(1);
  }
}

runManualHeadedScrape();
