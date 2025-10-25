const express = require('express');
const router = express.Router();

// Personal Spotify credentials - set these in your .env file
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = 'https://portfolio-bice-beta-a4ejdfdsaj.vercel.app/callback';

// Your personal Spotify tokens (get these once and store in .env)
let personalAccessToken = process.env.SPOTIFY_ACCESS_TOKEN;
let personalRefreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
let tokenExpiresAt = process.env.SPOTIFY_TOKEN_EXPIRES_AT ? parseInt(process.env.SPOTIFY_TOKEN_EXPIRES_AT) : null;

// Refresh your personal access token when needed
async function refreshPersonalToken() {
  if (!personalRefreshToken) {
    throw new Error('No refresh token available. Please update your .env file.');
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: personalRefreshToken
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error_description || 'Failed to refresh token');
    }

    // Update tokens
    personalAccessToken = data.access_token;
    if (data.refresh_token) {
      personalRefreshToken = data.refresh_token;
    }
    tokenExpiresAt = Date.now() + (data.expires_in * 1000);

    console.log('Spotify token refreshed successfully');
    return data.access_token;

  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
}

// Get valid access token (refresh if needed)
async function getValidAccessToken() {
  if (!personalAccessToken) {
    throw new Error('No Spotify access token found. Please set SPOTIFY_ACCESS_TOKEN in your .env file.');
  }

  // Check if token is expired (with 5 minute buffer)
  if (tokenExpiresAt && Date.now() >= tokenExpiresAt - 300000) {
    console.log('Token expired, refreshing...');
    return await refreshPersonalToken();
  }

  return personalAccessToken;
}

// Get currently playing track (public endpoint - no auth required for visitors)
router.get('/currently-playing', async (req, res) => {
  try {
    const accessToken = await getValidAccessToken();

    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.status === 204) {
      // No content - not playing anything
      return res.json({ 
        success: true, 
        isPlaying: false, 
        message: 'No track currently playing' 
      });
    }

    if (response.status === 401) {
      // Token expired, try to refresh
      try {
        const newToken = await refreshPersonalToken();
        const retryResponse = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
          headers: {
            'Authorization': `Bearer ${newToken}`
          }
        });
        
        if (retryResponse.status === 204) {
          return res.json({ 
            success: true, 
            isPlaying: false, 
            message: 'No track currently playing' 
          });
        }
        
        const retryData = await retryResponse.json();
        return res.json({ 
          success: true, 
          isPlaying: retryData.is_playing, 
          track: retryData.item 
        });
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        return res.status(500).json({ 
          error: 'Spotify authentication failed. Please check your tokens.',
          details: refreshError.message 
        });
      }
    }

    const data = await response.json();
    
    res.json({ 
      success: true, 
      isPlaying: data.is_playing, 
      track: data.item 
    });

  } catch (error) {
    console.error('Currently playing error:', error);
    res.status(500).json({ 
      error: 'Failed to get currently playing track',
      details: error.message 
    });
  }
});

// Get recently played tracks (fallback when not currently playing)
router.get('/recently-played', async (req, res) => {
  try {
    const accessToken = await getValidAccessToken();

    const response = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.status === 401) {
      try {
        const newToken = await refreshPersonalToken();
        const retryResponse = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
          headers: {
            'Authorization': `Bearer ${newToken}`
          }
        });
        
        const retryData = await retryResponse.json();
        return res.json({ 
          success: true, 
          track: retryData.items[0]?.track || null 
        });
      } catch (refreshError) {
        return res.status(500).json({ 
          error: 'Spotify authentication failed',
          details: refreshError.message 
        });
      }
    }

    const data = await response.json();
    
    res.json({ 
      success: true, 
      track: data.items[0]?.track || null 
    });

  } catch (error) {
    console.error('Recently played error:', error);
    res.status(500).json({ 
      error: 'Failed to get recently played track',
      details: error.message 
    });
  }
});

// Health check endpoint
router.get('/status', (req, res) => {
  res.json({ 
    status: 'ok',
    hasToken: !!personalAccessToken,
    hasRefreshToken: !!personalRefreshToken,
    tokenExpiresAt: tokenExpiresAt,
    isExpired: tokenExpiresAt ? Date.now() >= tokenExpiresAt - 300000 : null
  });
});

module.exports = router;