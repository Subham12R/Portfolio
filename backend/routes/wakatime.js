const express = require('express');
const router = express.Router();

const WAKATIME_API_URL = 'https://api.wakatime.com/api/v1';

// Import OAuth token management
const { getValidAccessToken } = require('./wakatime-oauth');

// Fallback to API key if OAuth not configured (for backward compatibility)
const WAKATIME_API_KEY = process.env.WAKATIME_API_KEY;

// Helper to get authentication header (OAuth Bearer token or API key fallback)
async function getAuthHeader() {
  try {
    // Try to use OAuth token first (automatic refresh if needed)
    const accessToken = await getValidAccessToken();
    return `Bearer ${accessToken}`;
  } catch (error) {
    // Fallback to API key if OAuth not configured
    if (WAKATIME_API_KEY) {
      console.warn('Using WAKATIME_API_KEY fallback. Consider setting up OAuth for better security.');
      return `Basic ${Buffer.from(`${WAKATIME_API_KEY}:`).toString('base64')}`;
    }
    // Return error info but don't throw - let the API endpoint handle it
    throw new Error('WakaTime not connected. Please authorize at /api/wakatime/oauth/authorize');
  }
}

// Rate limiting state to track 429 errors and implement backoff
const rateLimitState = {
  last429Time: null,
  consecutive429Count: 0,
  backoffUntil: null
};

// Helper to check if we should back off due to rate limiting
const shouldBackOff = () => {
  if (rateLimitState.backoffUntil && new Date() < rateLimitState.backoffUntil) {
    return true;
  }
  return false;
};

// Helper to handle 429 errors and set backoff
const handleRateLimit = () => {
  const now = new Date();
  rateLimitState.last429Time = now;
  rateLimitState.consecutive429Count += 1;
  
  // Exponential backoff: 1min, 2min, 4min, 8min (max 10min)
  const backoffMinutes = Math.min(Math.pow(2, rateLimitState.consecutive429Count - 1), 10);
  rateLimitState.backoffUntil = new Date(now.getTime() + backoffMinutes * 60 * 1000);
  
  // Reset counter after 30 minutes of no 429 errors
  setTimeout(() => {
    if (rateLimitState.consecutive429Count > 0) {
      rateLimitState.consecutive429Count = Math.max(0, rateLimitState.consecutive429Count - 1);
    }
  }, 30 * 60 * 1000);
};

// Reset backoff on successful request
const resetRateLimit = () => {
  if (rateLimitState.consecutive429Count > 0) {
    rateLimitState.consecutive429Count = 0;
  }
  rateLimitState.backoffUntil = null;
};

// Get current status (what you're coding now)
router.get('/status', async (req, res) => {
  try {
    // Check if we should back off due to rate limiting
    if (shouldBackOff()) {
      const backoffMinutes = Math.ceil((rateLimitState.backoffUntil - new Date()) / (1000 * 60));
      return res.json({
        success: false,
        error: 'WakaTime API rate limited',
        details: `Rate limit backoff active. Please wait ${backoffMinutes} minute(s) before retrying.`,
        statusCode: 429,
        retryAfter: rateLimitState.backoffUntil
      });
    }

    // Get authentication header (OAuth Bearer token or API key fallback)
    const authHeader = await getAuthHeader();

    const response = await fetch(`${WAKATIME_API_URL}/users/current/status`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });

    // Handle different error status codes - return 200 with error info instead of 500
    if (!response.ok) {
      let errorText = 'Unknown error';
      try {
        errorText = await response.text();
      } catch (e) {
        // If we can't read the error, just use status
      }
      
      // Handle rate limiting (429) - implement backoff
      if (response.status === 429) {
        handleRateLimit();
        // Don't log 429 errors repeatedly - they're expected when hitting rate limits
        if (rateLimitState.consecutive429Count <= 3) {
          console.warn(`WakaTime API rate limited (429). Implementing ${Math.min(Math.pow(2, rateLimitState.consecutive429Count - 1), 10)} minute backoff.`);
        }
        return res.json({
          success: false,
          error: 'WakaTime API rate limited',
          details: 'Too many requests. Please try again later.',
          statusCode: 429,
          retryAfter: rateLimitState.backoffUntil
        });
      }
      
      // Don't log 404 errors as critical - they're expected when certain endpoints aren't available
      if (response.status !== 404 && response.status !== 429) {
        console.error(`WakaTime API error (${response.status}):`, errorText);
      }
      
      // Return 200 with error info instead of 500 to prevent breaking frontend
      return res.json({
        success: false,
        error: `WakaTime API error: ${response.status}`,
        details: errorText,
        statusCode: response.status
      });
    }

    const data = await response.json();
    
    // Reset rate limit counter on successful request
    resetRateLimit();
    
    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('WakaTime status API error:', error);
    // Return 200 with error info instead of 500 to prevent breaking frontend
    res.json({
      success: false,
      error: 'Failed to fetch WakaTime status',
      details: error.message
    });
  }
});

// Get status bar data (current coding activity)
router.get('/status-bar', async (req, res) => {
  try {
    // Check if we should back off due to rate limiting
    if (shouldBackOff()) {
      const backoffMinutes = Math.ceil((rateLimitState.backoffUntil - new Date()) / (1000 * 60));
      return res.json({
        success: false,
        error: 'WakaTime API rate limited',
        details: `Rate limit backoff active. Please wait ${backoffMinutes} minute(s) before retrying.`,
        statusCode: 429,
        retryAfter: rateLimitState.backoffUntil
      });
    }

    // Get authentication header
    const authHeader = await getAuthHeader();

    // First check current status to see if actively coding right now
    let currentStatusResponse = await fetch(`${WAKATIME_API_URL}/users/current/status`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });

    let isCurrentlyCoding = false;
    let currentStatusData = null;

    // Don't treat 404 as error for status endpoint - it just means no current activity
    if (currentStatusResponse.ok) {
      currentStatusData = await currentStatusResponse.json();
      // Check if currently coding (entity exists and is recent)
      if (currentStatusData.data && currentStatusData.data.entity) {
        // Check if last heartbeat is within last 2 minutes (actively coding)
        const lastHeartbeat = currentStatusData.data.last_heartbeat_at;
        if (lastHeartbeat) {
          const heartbeatTime = new Date(lastHeartbeat);
          const now = new Date();
          const diffMinutes = (now - heartbeatTime) / (1000 * 60);
          isCurrentlyCoding = diffMinutes < 2;
        }
      }
    } else if (currentStatusResponse.status === 404) {
      // 404 is expected when no current status exists - silently continue
      // Don't log as error
    }

    // Get status bar for today
    let response = await fetch(`${WAKATIME_API_URL}/users/current/status_bar/today`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });

    let data = null;
    let isToday = true;

    if (response.ok) {
      data = await response.json();
      // Check if there's actual coding data
      if (data.data && data.data.text && data.data.text !== '0 secs') {
        res.json({
          success: true,
          data: data,
          isToday: true,
          isCurrentlyCoding: isCurrentlyCoding,
          currentStatus: currentStatusData?.data || null
        });
        return;
      }
    } else if (response.status === 404) {
      // 404 is expected when no data for today - try yesterday
    }

    // If no data for today, try yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    response = await fetch(`${WAKATIME_API_URL}/users/current/status_bar/${yesterdayStr}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      data = await response.json();
      isToday = false;
    } else if (response.status === 404) {
      // 404 is expected when no data for yesterday either - continue with null data
    }

    if (data && data.data && data.data.text && data.data.text !== '0 secs') {
      res.json({
        success: true,
        data: data,
        isToday: isToday,
        isCurrentlyCoding: isCurrentlyCoding,
        currentStatus: currentStatusData?.data || null
      });
    } else {
      // No data for today or yesterday
      res.json({
        success: true,
        data: null,
        isToday: false,
        isCurrentlyCoding: isCurrentlyCoding,
        currentStatus: currentStatusData?.data || null,
        message: 'No recent coding activity found'
      });
    }

  } catch (error) {
    console.error('WakaTime status bar API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch WakaTime status bar data',
      details: error.message
    });
  }
});

// Get all time since today (total coding time and last activity)
router.get('/all-time-since-today', async (req, res) => {
  try {
    // Check if we should back off due to rate limiting
    if (shouldBackOff()) {
      const backoffMinutes = Math.ceil((rateLimitState.backoffUntil - new Date()) / (1000 * 60));
      return res.json({
        success: false,
        error: 'WakaTime API rate limited',
        details: `Rate limit backoff active. Please wait ${backoffMinutes} minute(s) before retrying.`,
        statusCode: 429,
        retryAfter: rateLimitState.backoffUntil
      });
    }

    // Get authentication header
    const authHeader = await getAuthHeader();

    const response = await fetch(`${WAKATIME_API_URL}/users/current/all_time_since_today`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      // Handle rate limiting
      if (response.status === 429) {
        handleRateLimit();
        return res.json({
          success: false,
          error: 'WakaTime API rate limited',
          details: 'Too many requests. Please try again later.',
          statusCode: 429
        });
      }
      throw new Error(`WakaTime API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Reset rate limit counter on successful request
    resetRateLimit();
    
    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    if (!error.message?.includes('429')) {
      console.error('WakaTime all time API error:', error);
    }
    res.json({
      success: false,
      error: 'Failed to fetch WakaTime all time data',
      details: error.message
    });
  }
});

// Get durations for current user (with optional date parameter)
router.get('/durations', async (req, res) => {
  try {
    const { date } = req.query;
    const dateParam = date ? `?date=${date}` : '';
    
    // Get authentication header
    const authHeader = await getAuthHeader();

    const response = await fetch(`${WAKATIME_API_URL}/users/current/durations${dateParam}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      // Handle rate limiting
      if (response.status === 429) {
        handleRateLimit();
        return res.json({
          success: false,
          error: 'WakaTime API rate limited',
          details: 'Too many requests. Please try again later.',
          statusCode: 429
        });
      }
      
      // 404 errors are expected for some endpoints when no data exists
      if (response.status === 404) {
        resetRateLimit(); // Successful response even if empty
        return res.json({
          success: true,
          data: { data: [] },
          message: 'No durations data available'
        });
      }
      throw new Error(`WakaTime API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Reset rate limit counter on successful request
    resetRateLimit();
    
    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    // Don't log 404 errors as critical - they're expected when no data exists
    if (!error.message?.includes('404') && !error.message?.includes('429')) {
      console.error('WakaTime durations API error:', error);
    }
    res.json({
      success: false,
      error: 'Failed to fetch WakaTime durations',
      details: error.message
    });
  }
});

// Get heartbeats for current user (for real-time tracking)
router.get('/heartbeats', async (req, res) => {
  try {
    const { date } = req.query;
    const dateParam = date ? `?date=${date}` : '';
    
    // Get authentication header
    const authHeader = await getAuthHeader();

    const response = await fetch(`${WAKATIME_API_URL}/users/current/heartbeats${dateParam}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      // Handle rate limiting
      if (response.status === 429) {
        handleRateLimit();
        return res.json({
          success: false,
          error: 'WakaTime API rate limited',
          details: 'Too many requests. Please try again later.',
          statusCode: 429
        });
      }
      
      // 404 errors are expected for some endpoints when no data exists
      if (response.status === 404) {
        resetRateLimit(); // Successful response even if empty
        return res.json({
          success: true,
          data: { data: [] },
          message: 'No heartbeats data available'
        });
      }
      throw new Error(`WakaTime API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Reset rate limit counter on successful request
    resetRateLimit();
    
    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    // Don't log 404 or 429 errors as critical - they're expected
    if (!error.message?.includes('404') && !error.message?.includes('429')) {
      console.error('WakaTime heartbeats API error:', error);
    }
    res.json({
      success: false,
      error: 'Failed to fetch WakaTime heartbeats',
      details: error.message
    });
  }
});

module.exports = router;

