// Load .env from parent dir in development, or from current dir, or rely on platform env vars
const path = require('path');
const parentEnv = path.resolve(__dirname, '..', '.env');
const localEnv = path.resolve(__dirname, '.env');
const fs = require('fs');
if (fs.existsSync(parentEnv)) {
  require('dotenv').config({ path: parentEnv });
} else if (fs.existsSync(localEnv)) {
  require('dotenv').config({ path: localEnv });
} else {
  require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');

const app = express();

// Security headers
app.use(helmet());

// CORS — allow only CLIENT_URL
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (server-to-server, curl, etc.)
    if (!origin) return callback(null, true);
    if (origin === allowedOrigin) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// JSON body parser
app.use(express.json());

// Global rate limiting — 100 requests per minute per IP
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    message: 'Demasiadas solicitudes, intente de nuevo más tarde',
    code: 'RATE_LIMITED'
  }
});
app.use(globalLimiter);

// Routes
const authRoutes = require('./routes/auth');
const registroRoutes = require('./routes/registros');
const dashboardRoutes = require('./routes/dashboard');
const empleadosRoutes = require('./routes/empleados');
const evacuacionRoutes = require('./routes/evacuacion');
app.use('/api/auth', authRoutes);
app.use('/api/registro', registroRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/empleados', empleadosRoutes);
app.use('/api/evacuacion', evacuacionRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: true,
      message: 'Origen no permitido por CORS',
      code: 'CORS_ERROR'
    });
  }
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: 'Error interno del servidor',
    code: 'INTERNAL_ERROR'
  });
});

// Create HTTP server (for Socket.io integration later)
const server = http.createServer(app);

// Initialize Socket.io
const socketService = require('./services/socketService');
socketService.init(server);

// Inject socketService into registros controller
const { setSocketService } = require('./controllers/registrosController');
setSocketService(socketService);

// Initialize Cron service for automatic shift closures
const cronService = require('./services/cronService');
const emailService = require('./services/emailService');
const prisma = require('./db');
cronService.init({ prisma, socketService, emailService });

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`SafeCountix backend running on port ${PORT}`);
});

module.exports = { app, server };
