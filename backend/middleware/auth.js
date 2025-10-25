const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  console.log('Authenticate token check:', {
    hasAuthHeader: !!authHeader,
    hasToken: !!token,
    path: req.path
  });

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('JWT verified successfully for user:', decoded.userId);
    
    // Check if user exists in Supabase
    console.log('Checking user in Supabase for ID:', decoded.userId);
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, is_active')
      .eq('id', decoded.userId)
      .single();
    
    console.log('Supabase query result:', { user: user?.email, error: error?.message });

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token - user not found' });
    }

    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    console.log('User authenticated:', user.email, 'Role:', user.role);
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error: 'Token verification failed' });
  }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  console.log('Checking admin access for user:', req.user?.email, 'Role:', req.user?.role);
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  console.log('Admin access granted');
  next();
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, is_active')
      .eq('id', decoded.userId)
      .single();

    if (!error && user && user.is_active) {
      req.user = user;
    }
  } catch (error) {
    // Silently fail for optional auth
  }

  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  optionalAuth
};
