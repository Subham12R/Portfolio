const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// WakaTime OAuth configuration
const WAKATIME_CLIENT_ID = process.env.WAKATIME_CLIENT_ID;
const WAKATIME_CLIENT_SECRET = process.env.WAKATIME_CLIENT_SECRET;
const WAKATIME_REDIRECT_URI = process.env.WAKATIME_REDIRECT_URI || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/wakatime/callback`;

// Ensure redirect URI matches the route
if (!process.env.WAKATIME_REDIRECT_URI) {
  console.warn('WAKATIME_REDIRECT_URI not set. Using default:', WAKATIME_REDIRECT_URI);
  console.warn('Make sure this matches your WakaTime app settings and frontend route!');
}
const WAKATIME_AUTHORIZE_URL = 'https://wakatime.com/oauth/authorize';
const WAKATIME_TOKEN_URL = 'https://wakatime.com/oauth/token';
const WAKATIME_REVOKE_URL = 'https://wakatime.com/oauth/revoke';

// WakaTime tokens - read from .env file (like Spotify)
// After OAuth callback, add these to your .env file
let wakatimeAccessToken = process.env.WAKATIME_ACCESS_TOKEN;
let wakatimeRefreshToken = process.env.WAKATIME_REFRESH_TOKEN;
let wakatimeTokenExpiresAt = process.env.WAKATIME_TOKEN_EXPIRES_AT ? parseInt(process.env.WAKATIME_TOKEN_EXPIRES_AT) : null;

// Helper function to check if token needs refresh
function needsRefresh() {
  if (!wakatimeTokenExpiresAt) return true;
  const buffer = 300000; // 5 minutes
  return Date.now() >= wakatimeTokenExpiresAt - buffer;
}

// Refresh WakaTime access token when needed
async function refreshWakaTimeToken() {
  if (!wakatimeRefreshToken) {
    throw new Error('No refresh token available. Please update your .env file.');
  }

  if (!WAKATIME_CLIENT_ID || !WAKATIME_CLIENT_SECRET) {
    throw new Error('WakaTime OAuth credentials not configured. Please set WAKATIME_CLIENT_ID and WAKATIME_CLIENT_SECRET in .env');
  }

  try {
    const response = await fetch(WAKATIME_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: WAKATIME_CLIENT_ID,
        client_secret: WAKATIME_CLIENT_SECRET,
        refresh_token: wakatimeRefreshToken,
        redirect_uri: WAKATIME_REDIRECT_URI
      })
    });

    // Handle response (can be JSON or form-urlencoded)
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = Object.fromEntries(new URLSearchParams(text));
      } catch {
        data = JSON.parse(text);
      }
    }

    if (data.error) {
      throw new Error(data.error_description || data.error || 'Failed to refresh token');
    }

    // Update tokens
    wakatimeAccessToken = data.access_token;
    if (data.refresh_token) {
      wakatimeRefreshToken = data.refresh_token;
    }
    const expiresIn = data.expires_in || (365 * 24 * 60 * 60); // 365 days default
    wakatimeTokenExpiresAt = Date.now() + (expiresIn * 1000);

    console.log('WakaTime token refreshed successfully');
    return data.access_token;

  } catch (error) {
    console.error('WakaTime token refresh error:', error);
    throw error;
  }
}

// Get valid access token (refresh if needed)
async function getValidAccessToken() {
  if (!wakatimeAccessToken) {
    throw new Error('No WakaTime access token found. Please set WAKATIME_ACCESS_TOKEN in your .env file.');
  }

  // Check if token is expired (with 5 minute buffer)
  if (needsRefresh()) {
    console.log('WakaTime token expired, refreshing...');
    return await refreshWakaTimeToken();
  }

  return wakatimeAccessToken;
}

// Export the getValidAccessToken function for use in wakatime.js
module.exports.getValidAccessToken = getValidAccessToken;

// Root endpoint - list available OAuth endpoints
router.get('/', (req, res) => {
  res.json({
    message: 'WakaTime OAuth endpoints',
    endpoints: {
      authorize: '/api/wakatime/oauth/authorize',
      callback: '/api/wakatime/oauth/callback',
      status: '/api/wakatime/oauth/status',
      refresh: '/api/wakatime/oauth/refresh',
      revoke: '/api/wakatime/oauth/revoke'
    },
    note: 'Use /authorize to start the OAuth flow'
  });
});

// Step 1: Initiate OAuth authorization
router.get('/authorize', (req, res) => {
  if (!WAKATIME_CLIENT_ID) {
    return res.status(500).json({
      error: 'WakaTime OAuth not configured',
      message: 'WAKATIME_CLIENT_ID is not set in environment variables'
    });
  }

  // Generate state for CSRF protection
  const state = crypto.randomBytes(32).toString('hex');
  
  // Store state in session or pass as query param (for stateless, we'll pass it back)
  const params = new URLSearchParams({
    client_id: WAKATIME_CLIENT_ID,
    response_type: 'code',
    redirect_uri: WAKATIME_REDIRECT_URI,
    scope: 'read_heartbeats,read_summaries.editors,read_summaries.languages', // Request necessary scopes
    state: state
  });

  const authUrl = `${WAKATIME_AUTHORIZE_URL}?${params.toString()}`;
  
  res.json({
    authUrl: authUrl,
    state: state
  });
});

// Step 2: Handle OAuth callback and exchange code for token
router.post('/callback', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Authorization code missing'
      });
    }

    if (!WAKATIME_CLIENT_ID || !WAKATIME_CLIENT_SECRET) {
      return res.status(500).json({
        success: false,
        error: 'OAuth not configured'
      });
    }

    // Exchange code for access token
    // Allow redirect_uri to be overridden in request for flexibility
    const redirectUri = req.body.redirect_uri || WAKATIME_REDIRECT_URI;
    
    console.log('Exchanging WakaTime code with redirect_uri:', redirectUri);
    
    const response = await fetch(WAKATIME_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: WAKATIME_CLIENT_ID,
        client_secret: WAKATIME_CLIENT_SECRET,
        code: code,
        redirect_uri: redirectUri
      })
    });

    // Handle response (can be JSON or form-urlencoded)
    let data;
    const contentType = response.headers.get('content-type');
    const responseText = await response.text();
    
    console.log('WakaTime token response status:', response.status);
    console.log('WakaTime token response content-type:', contentType);
    console.log('WakaTime token response body:', responseText.substring(0, 200));
    
    if (contentType && contentType.includes('application/json')) {
      data = JSON.parse(responseText);
    } else {
      try {
        data = Object.fromEntries(new URLSearchParams(responseText));
      } catch {
        try {
          data = JSON.parse(responseText);
        } catch {
          data = { error: 'parse_error', error_description: responseText };
        }
      }
    }

    if (!response.ok || data.error) {
      console.error('WakaTime token exchange error:', data);
      return res.status(400).json({
        success: false,
        error: data.error || 'Token exchange failed',
        message: data.error_description || data.error || 'Failed to get tokens',
        details: data
      });
    }

    // Store tokens in memory (user should add to .env for persistence)
    wakatimeAccessToken = data.access_token;
    wakatimeRefreshToken = data.refresh_token;
    const expiresIn = data.expires_in || (365 * 24 * 60 * 60);
    wakatimeTokenExpiresAt = Date.now() + (expiresIn * 1000);

    console.log('✅ WakaTime OAuth connected - real-time data fetching active');
    console.log('📝 Add these to your backend/.env file for persistence:');
    console.log(`WAKATIME_ACCESS_TOKEN=${data.access_token}`);
    console.log(`WAKATIME_REFRESH_TOKEN=${data.refresh_token}`);
    console.log(`WAKATIME_TOKEN_EXPIRES_AT=${wakatimeTokenExpiresAt}`);

    res.json({
      success: true,
      message: 'Connected successfully',
      expires_at: wakatimeTokenExpiresAt,
      // Include tokens in response so user can add to .env
      tokens: {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: wakatimeTokenExpiresAt
      }
    });

  } catch (error) {
    console.error('WakaTime OAuth error:', error);
    res.status(500).json({
      success: false,
      error: 'Connection failed',
      message: error.message
    });
  }
});

// Get current token status
router.get('/status', (req, res) => {
  const hasToken = !!wakatimeAccessToken;
  const isExpired = needsRefresh();
  
  res.json({
    authorized: hasToken,
    expires_at: wakatimeTokenExpiresAt,
    isExpired: isExpired,
    needsRefresh: isExpired && !!wakatimeRefreshToken
  });
});

// Revoke tokens
// Supports: token revocation, user_id revocation, all tokens for user, all tokens for app
// Body can be JSON or form-urlencoded (both supported by WakaTime API)
router.post('/revoke', async (req, res) => {
  try {
    if (!WAKATIME_CLIENT_ID || !WAKATIME_CLIENT_SECRET) {
      return res.status(500).json({
        error: 'OAuth credentials not configured'
      });
    }

    const { token, user_id, all } = req.body;
    
    // Build revoke request body
    const revokeData = {
      client_id: WAKATIME_CLIENT_ID,
      client_secret: WAKATIME_CLIENT_SECRET
    };

    // Add optional parameters based on request
    if (all === true || all === 'true') {
      revokeData.all = 'true';
      if (token) {
        revokeData.token = token; // Revoke all tokens for user (using their token)
      }
      // If no token provided with all=true, revokes all tokens for the app
    } else if (user_id) {
      revokeData.user_id = user_id; // Revoke all tokens for specific user
    } else {
      // Default: revoke the provided token or current tokens
      const tokenToRevoke = token || wakatimeAccessToken || wakatimeRefreshToken;
      if (!tokenToRevoke) {
        return res.status(400).json({
          error: 'No token to revoke. Provide token, user_id, or set all=true'
        });
      }
      revokeData.token = tokenToRevoke;
    }

    // Support both JSON and form-urlencoded (WakaTime supports both)
    const contentType = req.headers['content-type'] || 'application/json';
    const useFormUrlEncoded = contentType.includes('application/x-www-form-urlencoded');

    const response = await fetch(WAKATIME_REVOKE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': useFormUrlEncoded ? 'application/x-www-form-urlencoded' : 'application/json',
      },
      body: useFormUrlEncoded 
        ? new URLSearchParams(revokeData).toString()
        : JSON.stringify(revokeData)
    });

    // WakaTime returns 200 success even if token is already revoked/expired
    if (response.ok) {
      // Clear local tokens if we revoked current tokens
      if (!user_id && !all && (!token || token === wakatimeAccessToken || token === wakatimeRefreshToken)) {
        wakatimeAccessToken = null;
        wakatimeRefreshToken = null;
        wakatimeTokenExpiresAt = null;
      }

      res.json({
        success: true,
        message: 'Tokens revoked successfully'
      });
    } else {
      const errorText = await response.text().catch(() => 'Unknown error');
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error_description: errorText };
      }
      
      res.status(response.status).json({
        error: 'Failed to revoke tokens',
        message: errorData.error_description || errorData.error || 'Unknown error'
      });
    }

  } catch (error) {
    console.error('WakaTime revoke error:', error);
    res.status(500).json({
      error: 'Revoke failed',
      message: error.message
    });
  }
});

// Manual refresh endpoint (for testing)
router.post('/refresh', async (req, res) => {
  try {
    const newToken = await refreshWakaTimeToken();
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      expires_at: wakatimeTokenExpiresAt
    });
  } catch (error) {
    res.status(500).json({
      error: 'Token refresh failed',
      message: error.message
    });
  }
});

module.exports.router = router;

