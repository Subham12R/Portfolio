const express = require('express');
const router = express.Router();

const WAKATIME_API_URL = 'https://api.wakatime.com/api/v1';
const FETCH_TIMEOUT = 30000; // 30 seconds timeout

// Import OAuth token management
const { getValidAccessToken } = require('./wakatime-oauth');

// Fallback to API key if OAuth not configured (for backward compatibility)
const WAKATIME_API_KEY = process.env.WAKATIME_API_KEY;

// Helper function to create fetch with timeout
function fetchWithTimeout(url, options = {}, timeout = FETCH_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  return fetch(url, {
    ...options,
    signal: controller.signal
  }).finally(() => {
    clearTimeout(timeoutId);
  });
}

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

// Root endpoint - list available WakaTime endpoints
router.get('/', (req, res) => {
  res.json({
    message: 'WakaTime API endpoints',
    endpoints: {
      status: '/api/wakatime/status',
      statusBar: '/api/wakatime/status-bar',
      allTimeSinceToday: '/api/wakatime/all-time-since-today',
      durations: '/api/wakatime/durations?date=YYYY-MM-DD',
      heartbeats: '/api/wakatime/heartbeats?date=YYYY-MM-DD',
      projectCommits: '/api/wakatime/projects/:project/commits',
      editors: '/api/wakatime/editors',
      oauth: {
        authorize: '/api/wakatime/oauth/authorize',
        callback: '/api/wakatime/oauth/callback',
        status: '/api/wakatime/oauth/status',
        refresh: '/api/wakatime/oauth/refresh',
        revoke: '/api/wakatime/oauth/revoke'
      }
    },
    note: 'All endpoints require OAuth authentication or WAKATIME_API_KEY'
  });
});

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

    const response = await fetchWithTimeout(`${WAKATIME_API_URL}/users/current/status`, {
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
    // Handle network/timeout errors gracefully
    if (error.name === 'AbortError' || error.code === 'UND_ERR_CONNECT_TIMEOUT' || error.message?.includes('timeout')) {
      // Don't spam console with timeout errors - they're expected when network is slow
      if (Math.random() < 0.1) { // Only log 10% of timeout errors to reduce spam
        console.warn('WakaTime API timeout - network may be slow or API unavailable');
      }
      return res.json({
        success: false,
        error: 'WakaTime API timeout',
        details: 'Request timed out. The WakaTime API may be slow or unavailable. Please try again later.',
        statusCode: 408
      });
    }
    
    // Log authentication errors more clearly
    if (error.message?.includes('WakaTime not connected') || error.message?.includes('No WakaTime access token')) {
      console.error('WakaTime authentication error:', error.message);
      return res.json({
        success: false,
        error: 'WakaTime not authenticated',
        details: error.message || 'Please authorize at /api/wakatime/oauth/authorize',
        statusCode: 401
      });
    }
    
    // Only log unexpected errors
    if (!error.message?.includes('timeout') && !error.message?.includes('ECONNREFUSED') && !error.message?.includes('ENOTFOUND')) {
      console.error('WakaTime status API error:', error.message, error.stack);
    }
    
    // Return 200 with error info instead of 500 to prevent breaking frontend
    res.json({
      success: false,
      error: 'Failed to fetch WakaTime status',
      details: error.message || 'Network error occurred',
      statusCode: 500
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
    let currentStatusResponse = await fetchWithTimeout(`${WAKATIME_API_URL}/users/current/status`, {
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
    let response = await fetchWithTimeout(`${WAKATIME_API_URL}/users/current/status_bar/today`, {
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

    response = await fetchWithTimeout(`${WAKATIME_API_URL}/users/current/status_bar/${yesterdayStr}`, {
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

    const response = await fetchWithTimeout(`${WAKATIME_API_URL}/users/current/all_time_since_today`, {
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

    const response = await fetchWithTimeout(`${WAKATIME_API_URL}/users/current/durations${dateParam}`, {
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
// date parameter is optional - defaults to today if not provided (format: YYYY-MM-DD)
router.get('/heartbeats', async (req, res) => {
  try {
    let { date } = req.query;
    
    // If no date provided, default to today (in UTC to avoid timezone issues)
    if (!date) {
      const today = new Date();
      const year = today.getUTCFullYear();
      const month = String(today.getUTCMonth() + 1).padStart(2, '0');
      const day = String(today.getUTCDate()).padStart(2, '0');
      date = `${year}-${month}-${day}`;
    }
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format',
        details: 'Date must be in YYYY-MM-DD format (e.g., 2025-11-16)'
      });
    }
    
    // Validate date is not in the future (compare dates, not times)
    const requestedDate = new Date(date + 'T00:00:00Z');
    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const requestedDateUTC = new Date(Date.UTC(requestedDate.getUTCFullYear(), requestedDate.getUTCMonth(), requestedDate.getUTCDate()));
    
    // Only reject if the date is clearly in the future (more than 1 day ahead)
    // This accounts for timezone differences
    if (requestedDateUTC > todayUTC) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date',
        details: `Date cannot be in the future. Requested: ${date}, Today (UTC): ${todayUTC.toISOString().split('T')[0]}`
      });
    }
    
    // Get authentication header
    const authHeader = await getAuthHeader();

    const response = await fetchWithTimeout(`${WAKATIME_API_URL}/users/current/heartbeats?date=${date}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      let errorText = 'Unknown error';
      try {
        errorText = await response.text();
      } catch (e) {
        // If we can't read the error, just use status
      }
      
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
      
      // 400 errors - show more details
      if (response.status === 400) {
        console.error(`WakaTime heartbeats API 400 error for date ${date}:`, errorText);
        // Try to parse error as JSON for better error messages
        let errorDetails = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error || errorJson.message) {
            errorDetails = errorJson.error || errorJson.message;
          }
        } catch (e) {
          // Not JSON, use as-is
        }
        return res.json({
          success: false,
          error: 'WakaTime API bad request',
          details: errorDetails || `Invalid request for date: ${date}. Please check the date format (YYYY-MM-DD) and ensure it's not in the future.`,
          statusCode: 400,
          date: date
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
      throw new Error(`WakaTime API error: ${response.status} - ${errorText}`);
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

// Create a single heartbeat
router.post('/heartbeats', async (req, res) => {
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

    const response = await fetchWithTimeout(`${WAKATIME_API_URL}/users/current/heartbeats`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
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
      
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`WakaTime API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Reset rate limit counter on successful request
    resetRateLimit();
    
    res.status(202).json({
      success: true,
      data: data
    });

  } catch (error) {
    if (!error.message?.includes('429')) {
      console.error('WakaTime create heartbeat API error:', error);
    }
    res.json({
      success: false,
      error: 'Failed to create WakaTime heartbeat',
      details: error.message
    });
  }
});

// Create multiple heartbeats (bulk) - limited to 25 per request
router.post('/heartbeats.bulk', async (req, res) => {
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

    // Validate bulk data
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        details: 'Expected an array of heartbeats'
      });
    }

    if (req.body.length > 25) {
      return res.status(400).json({
        success: false,
        error: 'Too many heartbeats',
        details: 'Bulk endpoint is limited to 25 heartbeats per request'
      });
    }

    // Get authentication header
    const authHeader = await getAuthHeader();

    const response = await fetchWithTimeout(`${WAKATIME_API_URL}/users/current/heartbeats.bulk`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
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
      
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`WakaTime API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Reset rate limit counter on successful request
    resetRateLimit();
    
    res.status(202).json({
      success: true,
      data: data
    });

  } catch (error) {
    if (!error.message?.includes('429')) {
      console.error('WakaTime bulk create heartbeats API error:', error);
    }
    res.json({
      success: false,
      error: 'Failed to create WakaTime heartbeats',
      details: error.message
    });
  }
});

// Delete heartbeats (bulk)
router.delete('/heartbeats.bulk', async (req, res) => {
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

    // Validate request body
    if (!req.body || !req.body.date || !Array.isArray(req.body.ids)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        details: 'Expected { date: "YYYY-MM-DD", ids: [...] }'
      });
    }

    // Get authentication header
    const authHeader = await getAuthHeader();

    const response = await fetchWithTimeout(`${WAKATIME_API_URL}/users/current/heartbeats.bulk`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
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
      
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`WakaTime API error: ${response.status} - ${errorText}`);
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
      console.error('WakaTime delete heartbeats API error:', error);
    }
    res.json({
      success: false,
      error: 'Failed to delete WakaTime heartbeats',
      details: error.message
    });
  }
});

// Get commits for a project
router.get('/projects/:project/commits', async (req, res) => {
  try {
    const { project } = req.params;
    const { author, branch, page } = req.query;
    
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

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (author) queryParams.append('author', author);
    if (branch) queryParams.append('branch', branch);
    if (page) queryParams.append('page', page);
    
    const queryString = queryParams.toString();
    const url = `${WAKATIME_API_URL}/users/current/projects/${encodeURIComponent(project)}/commits${queryString ? `?${queryString}` : ''}`;

    const response = await fetchWithTimeout(url, {
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
      
      // 404 errors are expected when project doesn't exist or has no commits
      if (response.status === 404) {
        resetRateLimit();
        return res.json({
          success: true,
          data: {
            commits: [],
            total: 0,
            page: 1,
            total_pages: 0
          },
          message: 'No commits found for this project'
        });
      }
      
      // 403 errors mean commits aren't available (project might not have commits enabled or no permission)
      if (response.status === 403) {
        resetRateLimit();
        return res.json({
          success: true,
          data: {
            commits: [],
            total: 0,
            page: 1,
            total_pages: 0
          },
          message: 'Commits not available for this project'
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
    // Don't log 404, 403, or 429 errors as critical - they're expected
    if (!error.message?.includes('404') && !error.message?.includes('403') && !error.message?.includes('429')) {
      console.error('WakaTime commits API error:', error);
    }
    res.json({
      success: false,
      error: 'Failed to fetch WakaTime commits',
      details: error.message
    });
  }
});

// Get editors (IDEs) used by the user
router.get('/editors', async (req, res) => {
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

    const response = await fetchWithTimeout(`${WAKATIME_API_URL}/users/current/editors`, {
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
      
      // 404 errors are expected when no editor data exists
      if (response.status === 404) {
        resetRateLimit();
        return res.json({
          success: true,
          data: {
            data: []
          },
          message: 'No editor data available'
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
    if (!error.message?.includes('404') && !error.message?.includes('429')) {
      console.error('WakaTime editors API error:', error);
    }
    res.json({
      success: false,
      error: 'Failed to fetch WakaTime editors',
      details: error.message
    });
  }
});

module.exports = router;

