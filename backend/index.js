import 'dotenv/config';

import mongoose from 'mongoose';
import app from './app.js';
import { connectDB } from './config/db.js';
import Product from './models/Product.js';
import { seedDatabase } from './seed.js';

const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  const requiredProdVars = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'MONGODB_URI'];
  const missing = requiredProdVars.filter(
    (key) => !process.env[key] || process.env[key].includes('replace_in_prod')
  );
  if (missing.length > 0) {
    console.error(`❌ CRITICAL PRODUCTION CONFIG WARNING: Missing or placeholder env vars: ${missing.join(', ')}`);
  }
}

let server = null;

const startServer = async () => {
  try {
    const conn = await connectDB();
    if (conn && !isProd) {
      // Auto-seed database in dev/test only if empty
      const productCount = await Product.countDocuments().catch(() => 0);
      if (productCount === 0) {
        console.log('🌱 Database is empty. Running initial 30+ product seed...');
        await seedDatabase().catch((e) => console.warn('Seed warning:', e.message));
      }
    }
  } catch (dbErr) {
    console.error('⚠️ Database connection notice:', dbErr.message);
  }

  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ApexBazaar Backend running on http://0.0.0.0:${PORT} (${process.env.NODE_ENV || 'development'})`);
    if (process.env.ENABLE_SWAGGER !== 'false') {
      console.log(`📚 Swagger API Docs available at http://0.0.0.0:${PORT}/api-docs`);
    }
  });

  // Guard against slowloris / hung connections
  server.requestTimeout = 30000;
  server.headersTimeout = 35000;
};

const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      try {
        await mongoose.connection.close();
        console.log('🍃 MongoDB connection closed.');
      } catch (err) {
        console.error('Error closing MongoDB:', err.message);
      }
      process.exit(0);
    });
    setTimeout(() => {
      console.error('Forced shutdown after 10s timeout');
      process.exit(1);
    }, 10000).unref();
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Promise Rejection:', reason instanceof Error ? reason.stack : reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.stack || err.message);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

startServer();
