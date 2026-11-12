import mongoose from 'mongoose';

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const isProd = process.env.NODE_ENV === 'production';
  const uri = process.env.MONGODB_URI || (!isProd ? 'mongodb://127.0.0.1:27017/hayroo' : '');

  if (!uri) {
    console.error('❌ MONGODB_URI is not configured for production.');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: isProd ? 8000 : 2000,
      maxPoolSize: 20,
    });
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    if (isProd) {
      console.error(`❌ Production MongoDB connection failed (${err.message}). Ephemeral memory fallback is disabled in production.`);
      return null;
    }

    console.warn(`⚠️ Primary MongoDB connection failed (${err.message}). Starting MongoMemoryServer fallback...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const createTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('MongoMemoryServer download/startup timed out')), 3500)
      );
      const mongod = await Promise.race([MongoMemoryServer.create(), createTimeout]);
      const memoryUri = mongod.getUri();
      const conn = await mongoose.connect(memoryUri, { serverSelectionTimeoutMS: 2000 });
      console.log(`⚡ In-Memory MongoDB Connected at: ${memoryUri}`);
      return conn;
    } catch (memErr) {
      console.error(`❌ Failed to start In-Memory MongoDB: ${memErr.message}`);
      console.warn('⚠️ Server will continue running to serve health checks and await valid database credentials.');
      return null;
    }
  }
};
