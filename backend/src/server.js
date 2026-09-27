const app = require('./app');
const { initializeDatabase } = require('./config/database');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`\n==================================================`);
      console.log(`🚀 INE Price Tracker Backend is live!`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`==================================================\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();
