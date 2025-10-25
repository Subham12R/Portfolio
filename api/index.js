// Vercel serverless function entry point
const express = require('express');
const cors = require('cors');

// Create a new Express app for Vercel
const app = express();

// CORS configuration for Vercel
app.use(cors({
  origin: [
    'https://portfolio-two-nu-547du2vksm.vercel.app',
    'https://portfolio-bice-beta-a4ejdfdsaj.vercel.app',
    'http://localhost:5173'
  ],
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

// Import and use the main backend server
const backendApp = require('../backend/server.js');

// Mount the backend app
app.use('/', backendApp);

// Export for Vercel
module.exports = app;