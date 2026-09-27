const path = require('path');
const dotenv = require(path.resolve(__dirname, '../backend/node_modules/dotenv'));
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const { database, initializeDatabase } = require('../backend/src/config/database');

async function seedDatabase() {
  console.log('🌱 Starting Database Seeding...');
  try {
    await initializeDatabase();

    const sampleProducts = [
      {
        store_product_id: 'prod-001',
        product_name: 'Wireless Headphones Pro',
        selected_option: 'Black - 64GB'
      },
      {
        store_product_id: 'prod-002',
        product_name: 'Ergonomic Laptop Stand',
        selected_option: 'Aluminum Silver'
      },
      {
        store_product_id: 'prod-003',
        product_name: 'Braided USB-C Cable 2m',
        selected_option: '2m Nylon Red'
      }
    ];

    for (const p of sampleProducts) {
      console.log(`Adding tracked product: ${p.product_name} (${p.selected_option})`);
      const tracked = await database.trackProduct(p.store_product_id, p.product_name, p.selected_option);

      // Generate 5 historical data points over the last 3 days for rich demo graphs
      const now = Date.now();
      const interval = (3 * 24 * 60 * 60 * 1000) / 5;
      const basePrices = { 'prod-001': 2499, 'prod-002': 1299.5, 'prod-003': 499 };

      for (let i = 0; i < 5; i++) {
        const timestamp = new Date(now - (5 - i) * interval).toISOString();
        const priceVariance = (Math.random() * 30 - 15);
        const price = parseFloat((basePrices[p.store_product_id] + priceVariance).toFixed(2));
        const stock = Math.floor(Math.random() * 40) + 10;

        await database.saveScrapeRecord(tracked.id, price, stock, 'success', null, 0);
        await database.saveScrapeLog(tracked.id, 'success', `Historical seed scrape record inserted. Price: ₹${price}`, 1);
      }
    }

    console.log('✅ Database successfully seeded with 3 tracked products & historical price points!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during database seeding:', err);
    process.exit(1);
  }
}

seedDatabase();
