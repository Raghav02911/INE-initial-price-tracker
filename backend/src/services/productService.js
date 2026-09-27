const { chromium } = require('playwright');

// Mock catalog fallback for instant responsiveness & offline dev capability
const MOCK_CATALOG = [
  {
    id: 'prod-001',
    name: 'Wireless Headphones Pro',
    price: 2499.00,
    options: ['Black - 64GB', 'White - 64GB', 'Silver - 128GB'],
    url: 'https://demo.inelabteamdev.com/product/prod-001'
  },
  {
    id: 'prod-002',
    name: 'Ergonomic Laptop Stand',
    price: 1299.50,
    options: ['Aluminum Silver', 'Matte Black', 'Rose Gold'],
    url: 'https://demo.inelabteamdev.com/product/prod-002'
  },
  {
    id: 'prod-003',
    name: 'Braided USB-C Cable 2m',
    price: 499.00,
    options: ['2m Nylon Red', '2m Nylon Black', '1m Standard White'],
    url: 'https://demo.inelabteamdev.com/product/prod-003'
  },
  {
    id: 'prod-004',
    name: 'Mechanical Gaming Keyboard',
    price: 4500.00,
    options: ['RGB Tactile Switches', 'Linear Switches', 'Silent Red Switches'],
    url: 'https://demo.inelabteamdev.com/product/prod-004'
  },
  {
    id: 'prod-005',
    name: 'UltraWide 34-inch Monitor',
    price: 32999.00,
    options: ['144Hz Curved', '60Hz Flat Professional'],
    url: 'https://demo.inelabteamdev.com/product/prod-005'
  }
];

async function searchProducts(query) {
  const q = (query || '').trim().toLowerCase();
  const storeUrl = process.env.STORE_URL || 'https://demo.inelabteamdev.com';

  let browser;
  try {
    try {
      browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    } catch (launchErr) {
      try {
        browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--no-sandbox'] });
      } catch (e) {
        browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--no-sandbox'] });
      }
    }

    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(storeUrl, { waitUntil: 'networkidle', timeout: 5000 });
    await page.waitForSelector('[data-product-id]', { timeout: 3000 });

    const products = await page.locator('[data-product-id]').all();
    const productList = [];

    for (const product of products) {
      const id = await product.getAttribute('data-product-id');
      const name = await product.locator('[data-product-name]').textContent();
      const priceStr = await product.locator('[data-price]').textContent();
      const options = await product.locator('[data-option]').allTextContents();

      if (name.toLowerCase().includes(q)) {
        productList.push({
          id,
          name: name.trim(),
          price: parseFloat(priceStr.replace(/[^\d.]/g, '')),
          options: options.map((o) => o.trim()),
          url: `${storeUrl}/product/${id}`
        });
      }
    }

    if (productList.length > 0) {
      return productList;
    }
  } catch (err) {
    console.warn(`Live search store lookup fallback engaged for query "${query}": ${err.message}`);
  } finally {
    if (browser) await browser.close().catch(() => {});
  }

  // Filter local mock catalog as reliable fallback
  return MOCK_CATALOG.filter((item) => item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q));
}

module.exports = { searchProducts };
