// Vercel API route for health check
module.exports = (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime ? process.uptime() : 'N/A'
  });
};