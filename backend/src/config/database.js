const { createClient } = require('@supabase/supabase-js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const USE_LOCAL = process.env.USE_LOCAL_DB_FALLBACK === 'true' || !SUPABASE_URL || SUPABASE_URL.includes('your-project') || SUPABASE_URL.includes('demo.supabase.co');

let supabaseClient = null;
let sqliteDb = null;

if (!USE_LOCAL) {
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('⚡ Connected to Supabase Cloud DB');
  } catch (err) {
    console.warn('⚠️ Supabase connection error, falling back to local SQLite DB:', err.message);
  }
}

// Local SQLite DB Setup & Promisified Helper
const dbPath = path.resolve(__dirname, '../../price_tracker.db');

function getSqliteDb() {
  if (!sqliteDb) {
    sqliteDb = new sqlite3.Database(dbPath);
    initLocalTables();
  }
  return sqliteDb;
}

function initLocalTables() {
  const db = sqliteDb;
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS tracked_products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        store_product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        selected_option TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active INTEGER DEFAULT 1,
        last_scraped_at DATETIME,
        UNIQUE(store_product_id, selected_option)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS scrape_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tracked_product_id INTEGER NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        price REAL,
        stock INTEGER,
        status TEXT,
        error_message TEXT,
        retry_count INTEGER DEFAULT 0,
        FOREIGN KEY(tracked_product_id) REFERENCES tracked_products(id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS scrape_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tracked_product_id INTEGER NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT,
        message TEXT,
        attempt_number INTEGER,
        FOREIGN KEY(tracked_product_id) REFERENCES tracked_products(id) ON DELETE CASCADE
      )
    `);
  });
}

// Universal database abstraction layer
const dbAdapter = {
  isLocal: USE_LOCAL || !supabaseClient,

  async initializeDatabase() {
    if (this.isLocal) {
      getSqliteDb();
      console.log(`✓ Local SQLite Database initialized at ${dbPath}`);
      return true;
    } else {
      try {
        const { data, error } = await supabaseClient.from('tracked_products').select('id').limit(1);
        if (error) {
          console.warn('Supabase test query failed, switching to local DB:', error.message);
          this.isLocal = true;
          getSqliteDb();
          return true;
        }
        console.log('✓ Supabase connection verified');
        return true;
      } catch (err) {
        console.warn('Supabase check failed, switching to local DB:', err.message);
        this.isLocal = true;
        getSqliteDb();
        return true;
      }
    }
  },

  // Query Tracked Products
  async getTrackedProducts() {
    if (!this.isLocal && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('tracked_products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(p => ({ ...p, is_active: Boolean(p.is_active) }));
    } else {
      const db = getSqliteDb();
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM tracked_products WHERE is_active = 1 ORDER BY created_at DESC', [], (err, rows) => {
          if (err) return reject(err);
          resolve(rows.map(r => ({ ...r, is_active: Boolean(r.is_active) })));
        });
      });
    }
  },

  // Upsert Tracked Product
  async trackProduct(store_product_id, product_name, selected_option) {
    if (!this.isLocal && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('tracked_products')
        .upsert(
          {
            store_product_id,
            product_name,
            selected_option,
            is_active: true,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'store_product_id,selected_option' }
        )
        .select();
      if (error) throw error;
      return data[0];
    } else {
      const db = getSqliteDb();
      const now = new Date().toISOString();
      return new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO tracked_products (store_product_id, product_name, selected_option, is_active, created_at, updated_at)
           VALUES (?, ?, ?, 1, ?, ?)
           ON CONFLICT(store_product_id, selected_option) DO UPDATE SET
             product_name = excluded.product_name,
             is_active = 1,
             updated_at = excluded.updated_at`,
          [store_product_id, product_name, selected_option, now, now],
          function (err) {
            if (err) return reject(err);
            db.get('SELECT * FROM tracked_products WHERE store_product_id = ? AND selected_option = ?', [store_product_id, selected_option], (err2, row) => {
              if (err2) return reject(err2);
              resolve({ ...row, is_active: Boolean(row.is_active) });
            });
          }
        );
      });
    }
  },

  // Soft Delete Tracked Product
  async stopTracking(id) {
    if (!this.isLocal && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('tracked_products')
        .update({ is_active: false })
        .eq('id', id)
        .select();
      if (error) throw error;
      return data[0];
    } else {
      const db = getSqliteDb();
      return new Promise((resolve, reject) => {
        db.run('UPDATE tracked_products SET is_active = 0 WHERE id = ?', [id], function (err) {
          if (err) return reject(err);
          db.get('SELECT * FROM tracked_products WHERE id = ?', [id], (err2, row) => {
            if (err2) return reject(err2);
            resolve({ ...row, is_active: false });
          });
        });
      });
    }
  },

  // Save Scrape Record
  async saveScrapeRecord(productId, price, stock, status, errorMessage, retryCount) {
    const timestamp = new Date().toISOString();
    if (!this.isLocal && supabaseClient) {
      const { error } = await supabaseClient
        .from('scrape_records')
        .insert({
          tracked_product_id: productId,
          timestamp,
          price,
          stock,
          status,
          error_message: errorMessage,
          retry_count: retryCount
        });
      if (error) console.error('Error saving scrape record to Supabase:', error);

      if (status === 'success') {
        await supabaseClient
          .from('tracked_products')
          .update({ last_scraped_at: timestamp })
          .eq('id', productId);
      }
    } else {
      const db = getSqliteDb();
      return new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO scrape_records (tracked_product_id, timestamp, price, stock, status, error_message, retry_count)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [productId, timestamp, price, stock, status, errorMessage, retryCount],
          function (err) {
            if (err) console.error('Error saving scrape record to SQLite:', err);
            if (status === 'success') {
              db.run('UPDATE tracked_products SET last_scraped_at = ? WHERE id = ?', [timestamp, productId]);
            }
            resolve();
          }
        );
      });
    }
  },

  // Save Scrape Log
  async saveScrapeLog(productId, status, message, attemptNumber) {
    const timestamp = new Date().toISOString();
    if (!this.isLocal && supabaseClient) {
      const { error } = await supabaseClient
        .from('scrape_logs')
        .insert({
          tracked_product_id: productId,
          timestamp,
          status,
          message,
          attempt_number: attemptNumber
        });
      if (error) console.error('Error saving scrape log to Supabase:', error);
    } else {
      const db = getSqliteDb();
      return new Promise((resolve) => {
        db.run(
          `INSERT INTO scrape_logs (tracked_product_id, timestamp, status, message, attempt_number)
           VALUES (?, ?, ?, ?, ?)`,
          [productId, timestamp, status, message, attemptNumber],
          (err) => {
            if (err) console.error('Error saving scrape log to SQLite:', err);
            resolve();
          }
        );
      });
    }
  },

  // Get History for a product
  async getPriceHistory(productId, days = 7) {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - parseInt(days));
    const fromIso = fromDate.toISOString();

    if (!this.isLocal && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('scrape_records')
        .select('*')
        .eq('tracked_product_id', productId)
        .gte('timestamp', fromIso)
        .order('timestamp', { ascending: true });
      if (error) throw error;
      return data || [];
    } else {
      const db = getSqliteDb();
      return new Promise((resolve, reject) => {
        db.all(
          'SELECT * FROM scrape_records WHERE tracked_product_id = ? AND timestamp >= ? ORDER BY timestamp ASC',
          [productId, fromIso],
          (err, rows) => {
            if (err) return reject(err);
            resolve(rows || []);
          }
        );
      });
    }
  },

  // Get Logs for a product
  async getScrapeLogs(productId, limit = 50) {
    if (!this.isLocal && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('scrape_logs')
        .select('*')
        .eq('tracked_product_id', productId)
        .order('timestamp', { ascending: false })
        .limit(parseInt(limit));
      if (error) throw error;
      return data || [];
    } else {
      const db = getSqliteDb();
      return new Promise((resolve, reject) => {
        db.all(
          'SELECT * FROM scrape_logs WHERE tracked_product_id = ? ORDER BY timestamp DESC LIMIT ?',
          [productId, parseInt(limit)],
          (err, rows) => {
            if (err) return reject(err);
            resolve(rows || []);
          }
        );
      });
    }
  },

  // Get All Records for CSV Export
  async getAllScrapeRecordsForExport() {
    if (!this.isLocal && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('scrape_records')
        .select(`
          id,
          timestamp,
          price,
          stock,
          status,
          error_message,
          retry_count,
          tracked_products(store_product_id, product_name, selected_option)
        `)
        .order('timestamp', { ascending: false });
      if (error) throw error;
      return data.map(r => ({
        store_product_id: r.tracked_products?.store_product_id || '',
        product_name: r.tracked_products?.product_name || '',
        selected_option: r.tracked_products?.selected_option || '',
        timestamp: r.timestamp,
        price: r.price,
        stock: r.stock,
        status: r.status,
        error_message: r.error_message,
        retry_count: r.retry_count
      }));
    } else {
      const db = getSqliteDb();
      return new Promise((resolve, reject) => {
        const query = `
          SELECT 
            sr.id,
            sr.timestamp,
            sr.price,
            sr.stock,
            sr.status,
            sr.error_message,
            sr.retry_count,
            tp.store_product_id,
            tp.product_name,
            tp.selected_option
          FROM scrape_records sr
          LEFT JOIN tracked_products tp ON sr.tracked_product_id = tp.id
          ORDER BY sr.timestamp DESC
        `;
        db.all(query, [], (err, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        });
      });
    }
  }
};

module.exports = {
  supabase: supabaseClient,
  database: dbAdapter,
  initializeDatabase: () => dbAdapter.initializeDatabase()
};
