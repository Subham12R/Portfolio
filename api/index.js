// Vercel serverless function entry point
const app = require('../backend/server.js');

// Export the app directly for Vercel
module.exports = app;