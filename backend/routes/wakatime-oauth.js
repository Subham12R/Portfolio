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

// In-memory token storage (in production, use database)
// Format: { access_token, refresh_token, expires_at, token_type }
let wakatimeTokens = {
  access_token: process.env.WAKATIME_ACCESS_TOKEN || null,
  refresh_token: process.env.WAKATIME_REFRESH_TOKEN || null,
  expires_at: process.env.WAKATIME_TOKEN_EXPIRES_AT ? parseInt(process.env.WAKATIME_TOKEN_EXPIRES_AT) : null,
  token_type: 'Bearer'
};

// Helper to check if token needs refresh
function needsRefresh() {
  if (!wakatimeTokens.expires_at) return true;
  const buffer = 5 * 60 * 1000; // 5 minutes buffer
  return Date.now() >= wakatimeTokens.expires_at - buffer;
}

// Refresh access token using refresh token
async function refreshAccessToken() {
  if (!wakatimeTokens.refresh_token) {
    throw new Error('No refresh token available. Please re-authorize WakaTime.');
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
        refresh_token: wakatimeTokens.refresh_token,
        redirect_uri: WAKATIME_REDIRECT_URI
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error_description || data.error || 'Failed to refresh token');
    }

    // Update tokens
    wakatimeTokens.access_token = data.access_token;
    if (data.refresh_token) {
      wakatimeTokens.refresh_token = data.refresh_token;
    }
    // OAuth tokens using response_type=code expire after 365 days
    // Calculate expires_at based on expires_in (default to 365 days if not provided)
    const expiresIn = data.expires_in || (365 * 24 * 60 * 60); // 365 days in seconds
    wakatimeTokens.expires_at = Date.now() + (expiresIn * 1000);
    wakatimeTokens.token_type = data.token_type || 'Bearer';

    console.log('WakaTime token refreshed successfully');
    return wakatimeTokens.access_token;

  } catch (error) {
    console.error('WakaTime token refresh error:', error);
    throw error;
  }
}

// Get valid access token (refresh if needed)
async function getValidAccessToken() {
  if (!wakatimeTokens.access_token) {
    throw new Error('No WakaTime access token found. Please authorize WakaTime first.');
  }

  // Check if token is expired (with 5 minute buffer)
  if (needsRefresh()) {
    console.log('WakaTime token expired, refreshing...');
    return await refreshAccessToken();
  }

  return wakatimeTokens.access_token;
}

// Export the getValidAccessToken function for use in wakatime.js
module.exports.getValidAccessToken = getValidAccessToken;
module.exports.wakatimeTokens = wakatimeTokens;

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
    const { code, state } = req.body;

    if (!code) {
      return res.status(400).json({
        error: 'Authorization code missing',
        message: 'No authorization code provided'
      });
    }

    if (!WAKATIME_CLIENT_ID || !WAKATIME_CLIENT_SECRET) {
      return res.status(500).json({
        error: 'OAuth credentials not configured',
        message: 'WAKATIME_CLIENT_ID and WAKATIME_CLIENT_SECRET must be set'
      });
    }

    // Exchange code for access token
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
        redirect_uri: WAKATIME_REDIRECT_URI
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({
        error: data.error,
        message: data.error_description || 'Failed to exchange authorization code for token'
      });
    }

    // Store tokens
    wakatimeTokens.access_token = data.access_token;
    wakatimeTokens.refresh_token = data.refresh_token;
    const expiresIn = data.expires_in || (365 * 24 * 60 * 60); // 365 days default
    wakatimeTokens.expires_at = Date.now() + (expiresIn * 1000);
    wakatimeTokens.token_type = data.token_type || 'Bearer';

    console.log('WakaTime OAuth authorization successful');

    res.json({
      success: true,
      message: 'WakaTime authorization successful',
      expires_at: wakatimeTokens.expires_at
    });

  } catch (error) {
    console.error('WakaTime OAuth callback error:', error);
    res.status(500).json({
      error: 'OAuth callback failed',
      message: error.message
    });
  }
});

// Get current token status
router.get('/status', (req, res) => {
  const hasToken = !!wakatimeTokens.access_token;
  const isExpired = needsRefresh();
  
  res.json({
    authorized: hasToken,
    expires_at: wakatimeTokens.expires_at,
    isExpired: isExpired,
    needsRefresh: isExpired && !!wakatimeTokens.refresh_token
  });
});

// Revoke tokens
router.post('/revoke', async (req, res) => {
  try {
    if (!WAKATIME_CLIENT_ID || !WAKATIME_CLIENT_SECRET) {
      return res.status(500).json({
        error: 'OAuth credentials not configured'
      });
    }

    const tokenToRevoke = req.body.token || wakatimeTokens.access_token || wakatimeTokens.refresh_token;

    if (!tokenToRevoke) {
      return res.status(400).json({
        error: 'No token to revoke'
      });
    }

    const response = await fetch(WAKATIME_REVOKE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: WAKATIME_CLIENT_ID,
        client_secret: WAKATIME_CLIENT_SECRET,
        token: tokenToRevoke
      })
    });

    if (response.ok) {
      // Clear tokens
      wakatimeTokens = {
        access_token: null,
        refresh_token: null,
        expires_at: null,
        token_type: 'Bearer'
      };

      res.json({
        success: true,
        message: 'Tokens revoked successfully'
      });
    } else {
      const errorData = await response.json().catch(() => ({}));
      res.status(response.status).json({
        error: 'Failed to revoke tokens',
        message: errorData.error_description || 'Unknown error'
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
    const newToken = await refreshAccessToken();
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      expires_at: wakatimeTokens.expires_at
    });
  } catch (error) {
    res.status(500).json({
      error: 'Token refresh failed',
      message: error.message
    });
  }
});

module.exports.router = router;

