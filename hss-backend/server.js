const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const geocodeRoutes = require('./routes/geocode'); // Import geocode routes

// Initialize environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Enhanced CORS configuration
const allowedOrigins = [
  'https://www.healthcaresecuresystems.co.za',
  'http://localhost:8080',
];

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
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Enhanced body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enhanced request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request Body:', req.body);
  }
  next();
});

//Cookie parser
const cookieParser = require('cookie-parser');
app.use(cookieParser());


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', geocodeRoutes); // Mount geocode routes

// Health check endpoints
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
  });
});

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

// Enhanced error handling middleware
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

// Database connection with retry logic
const connectWithRetry = () => {
  mongoose
    .connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err.message);
      console.log('Retrying connection in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
    });
};

// Start server only after database connection
const startServer = () => {
  if (mongoose.connection.readyState === 1) {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🔑 Auth endpoints available at http://localhost:${PORT}/api/auth`);
    });
  } else {
    console.log('Waiting for database connection...');
    setTimeout(startServer, 1000);
  }
};

// Initial connection
connectWithRetry();
startServer();

// Graceful shutdown
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed due to app termination');
    process.exit(0);
  });
});
