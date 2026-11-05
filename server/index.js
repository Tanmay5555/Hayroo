import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import Product from './models/Product.js';
import { seedDatabase } from './seed.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // Auto-seed database if empty
  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    console.log('🌱 Database is empty. Running initial 30+ product seed...');
    await seedDatabase();
  }

  app.listen(PORT, () => {
    console.log(`🚀 ApexBazaar Backend running on http://localhost:${PORT}`);
    console.log(`📚 Swagger API Docs available at http://localhost:${PORT}/api-docs`);
  });
};

startServer();
