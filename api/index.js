// Vercel API route for root
module.exports = (req, res) => {
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
      spotify: '/api/spotify'
    }
  });
};