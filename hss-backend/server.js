// server.js - CORRECTED VERSION
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const geocodeRoutes = require('./routes/geocode');
const dashboardRoutes = require('./routes/dashboard');
const { closeAllTenantConnections } = require('./utils/multiTenantDb');

// Initialize environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const rawPrimaryUri = process.env.MONGO_URI || process.env.MONGODB_URI;
const rawFallbackUri = process.env.MONGO_URI_FALLBACK || 'mongodb://127.0.0.1:27017/HSSDB';
const normalizeUri = (s) => (s || '').trim().replace(/^['"]|['"]$/g, '');
const PRIMARY_MONGO_URI = normalizeUri(rawPrimaryUri);
const FALLBACK_MONGO_URI = normalizeUri(rawFallbackUri);
const MONGO_URI = PRIMARY_MONGO_URI || FALLBACK_MONGO_URI;

// Define allowed origins with env overrides
const envOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:3000',
  'https://www.healthcaresecuresystems.co.za',
  ...envOrigins,
];

// CORS options
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked by CORS: ${origin}`);
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  exposedHeaders: ['set-cookie'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request Body:', req.body);
  }
  next();
});

// Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', geocodeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
  });
});

// Root page
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Healthcare Secure System</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          h1 { color: #4a6fa5; }
          .status { 
            display: inline-block; 
            padding: 10px 20px; 
            border-radius: 5px; 
            font-weight: bold;
            background-color: #e1f5fe;
          }
        </style>
      </head>
      <body>
        <h1>Healthcare Secure System Backend</h1>
        <p class="status">Server is running</p>
        <p>MongoDB: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected'}</p>
        <p>API Documentation: <a href="/api-docs">/api-docs</a></p>
      </body>
    </html>
  `);
});

// Error handling
app.use((error, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}`, {
    error: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    body: req.body,
  });

  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : error.message;

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});

// DB connection with retry - Starts in background, does NOT block server startup
const connectWithRetry = () => {
  console.log(`Attempting to connect to MongoDB with URI: ${PRIMARY_MONGO_URI ? 'Atlas (Primary)' : 'Local (Fallback)'}`);
  
  mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  })
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⏳ Retrying connection in 10 seconds...');
    setTimeout(connectWithRetry, 10000);
  });
};

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err?.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('Mongoose disconnected');
});

// ✅ CRITICAL FIX: START THE SERVER IMMEDIATELY
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is NOW RUNNING on port ${PORT}`);
  console.log(`   Health Check: http://localhost:${PORT}/api/health`);
  console.log(`   Auth API: http://localhost:${PORT}/api/auth`);
});

// Now attempt the DB connection in the background
connectWithRetry();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nGraceful shutdown in progress...');
  await closeAllTenantConnections(); 
  server.close(() => {
    console.log('✅ HTTP server closed.');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed.');
      process.exit(0);
    });
  });
});