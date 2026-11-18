import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

import apiRoutes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';
import { setupSwagger } from './config/swagger.js';

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

// Trust reverse proxy (Nginx, Render, Cloudflare) for accurate IP rate limiting
app.set('trust proxy', 1);

// Security HTTP Headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Build allowed CORS origins list from environment & defaults
const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'https://apexbazaar.com',
  'https://www.apexbazaar.com',
  'https://hayroo.store',
  'https://www.hayroo.store',
  'https://hayroo-mocha.vercel.app',
];

const envOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(
  new Set([
    ...defaultOrigins,
    ...envOrigins,
    ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL.trim()] : []),
  ])
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no Origin header (curl, server-to-server, mobile apps)
      if (!origin) {
        return callback(null, true);
      }
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.includes('vercel.app')
      ) {
        return callback(null, true);
      }
      if (!isProd && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))) {
        return callback(null, true);
      }
      return callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
  })
);

// Correlation ID Middleware
app.use((req, res, next) => {
  const correlationId =
    req.headers['x-correlation-id'] || `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  next();
});

// Request logging
if (!isTest) {
  app.use(
    morgan(isProd ? 'combined' : 'dev')
  );
}

// Body parsing with bounded limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Custom recursive input sanitizer to strip MongoDB operators ($ / .)
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    obj.forEach(sanitizeObject);
    return obj;
  }
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object') {
      sanitizeObject(obj[key]);
    }
  }
  return obj;
};

app.use((req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.params) sanitizeObject(req.params);
  if (req.query) sanitizeObject(req.query);
  next();
});

// Rate Limiting (disabled in automated test suite)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
  message: { success: false, message: 'Too many requests, please try again shortly.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
  message: { success: false, message: 'Too many authentication attempts. Please try again in 15 minutes.' },
});

app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1/auth/phone/otp-request', authLimiter);
app.use('/api/v1/auth/phone/otp-verify', authLimiter);
app.use('/api/v1', apiLimiter);

// Serve uploaded media statically (with nosniff security header)
const uploadDirs = [
  path.join(process.cwd(), 'uploads'),
  path.join(process.cwd(), 'backend', 'uploads'),
  path.join(process.cwd(), 'public', 'uploads'),
];
for (const dir of uploadDirs) {
  if (fs.existsSync(dir)) {
    app.use(
      '/uploads',
      express.static(dir, {
        setHeaders: (res) => {
          res.setHeader('X-Content-Type-Options', 'nosniff');
        },
      })
    );
  }
}

// Swagger API Documentation (disable or restrict if explicitly configured)
if (process.env.ENABLE_SWAGGER !== 'false') {
  setupSwagger(app);
}

// API v1 Routes
app.use('/api/v1', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  res.json({
    status: 'ok',
    store: 'ApexBazaar Multi-Vendor Marketplace',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: dbStateMap[mongoose.connection.readyState] || 'unknown',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date(),
    rolesSupported: ['CUSTOMER', 'SELLER', 'ADMIN', 'SUPPORT_STAFF', 'DELIVERY_PARTNER'],
  });
});

// 404 & Global Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
