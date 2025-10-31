const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const workRoutes = require('./routes/work');
const certificateRoutes = require('./routes/certificates');
const gearRoutes = require('./routes/gears');
const aboutRoutes = require('./routes/about');
const uploadRoutes = require('./routes/upload');
const spotifyRoutes = require('./routes/spotify');
const wakatimeRoutes = require('./routes/wakatime');
const blogRoutes = require('./routes/blog');
const blogsRoutes = require('./routes/blogs');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting - More generous for portfolio use
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (more generous)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: true, // Allow all origins temporarily for testing
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Body parsing middleware
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Portfolio Backend API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      projects: '/api/projects',
      work: '/api/work',
      certificates: '/api/certificates',
      gears: '/api/gears',
      about: '/api/about',
      upload: '/api/upload',
      spotify: '/api/spotify',
      wakatime: '/api/wakatime',
      blog: '/api/blog',
      blogs: '/api/blogs'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/work', workRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/gears', gearRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/spotify', spotifyRoutes);
app.use('/api/wakatime', wakatimeRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/blogs', blogsRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ 
      error: 'Invalid JSON in request body' 
    });
  }
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
