import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import Product from './models/Product.js';
import { seedDatabase } from './seed.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const conn = await connectDB();
    if (conn) {
      // Auto-seed database if empty
      const productCount = await Product.countDocuments().catch(() => 0);
      if (productCount === 0) {
        console.log('🌱 Database is empty. Running initial 30+ product seed...');
        await seedDatabase().catch((e) => console.warn('Seed warning:', e.message));
      }
    }
  } catch (dbErr) {
    console.error('⚠️ Database connection notice:', dbErr.message);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ApexBazaar Backend running on http://0.0.0.0:${PORT}`);
    console.log(`📚 Swagger API Docs available at http://0.0.0.0:${PORT}/api-docs`);
  });
};

startServer();
