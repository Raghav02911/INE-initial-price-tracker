const { Parser } = require('json2csv');
const { database } = require('../config/database');

async function generateScrapeHistoryCSV() {
  const records = await database.getAllScrapeRecordsForExport();

  const csvData = records.map((record) => ({
    'Product ID': record.store_product_id || '',
    'Product Name': record.product_name || '',
    'Selected Option': record.selected_option || '',
    'Timestamp (ISO 8601, UTC)': record.timestamp,
    'Price (INR)': record.price !== null && record.price !== undefined ? record.price : '',
    'Stock': record.stock !== null && record.stock !== undefined ? record.stock : '',
    'Status': record.status || '',
    'Retry Count': record.retry_count || 0,
    'Error Message': record.error_message || ''
  }));

  const fields = [
    'Product ID',
    'Product Name',
    'Selected Option',
    'Timestamp (ISO 8601, UTC)',
    'Price (INR)',
    'Stock',
    'Status',
    'Retry Count',
    'Error Message'
  ];

  const json2csvParser = new Parser({ fields });
  return json2csvParser.parse(csvData);
}

module.exports = { generateScrapeHistoryCSV };
