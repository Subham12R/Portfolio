const express = require('express');
const router = express.Router();

// Personal Spotify credentials - set these in your .env file
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = 'https://subham12r.netlify.app/callback';

// Your personal Spotify tokens (get these once and store in .env)
let personalAccessToken = process.env.SPOTIFY_ACCESS_TOKEN;
let personalRefreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
let tokenExpiresAt = process.env.SPOTIFY_TOKEN_EXPIRES_AT ? parseInt(process.env.SPOTIFY_TOKEN_EXPIRES_AT) : null;

// Helper function to check if token needs refresh
function needsRefresh() {
  if (!tokenExpiresAt) return true;
  const buffer = 300000; // 5 minutes
  return Date.now() >= tokenExpiresAt - buffer;
}

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
  if (needsRefresh()) {
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

// Get both currently playing and last played tracks (combined endpoint)
router.get('/player-status', async (req, res) => {
  try {
    const accessToken = await getValidAccessToken();
    let nowPlaying = null;
    let isPlaying = false;
    let lastPlayed = null;

    // Fetch currently playing track
    try {
      const currentResponse = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (currentResponse.status === 200) {
        const currentData = await currentResponse.json();
        nowPlaying = currentData.item;
        isPlaying = currentData.is_playing;
      }
    } catch (error) {
      console.error('Error fetching currently playing:', error);
    }

    // Fetch last played track (always fetch as fallback)
    try {
      const recentResponse = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (recentResponse.status === 200) {
        const recentData = await recentResponse.json();
        lastPlayed = recentData.items[0]?.track || null;
      }
    } catch (error) {
      console.error('Error fetching recently played:', error);
    }

    // If we have now playing, use it; otherwise use last played
    const displayTrack = nowPlaying || lastPlayed;
    const trackType = nowPlaying ? 'now_playing' : 'last_played';

    res.json({
      success: true,
      nowPlaying: nowPlaying,
      lastPlayed: lastPlayed,
      isPlaying: isPlaying,
      displayTrack: displayTrack,
      trackType: trackType
    });

  } catch (error) {
    console.error('Player status error:', error);
    
    // Try to refresh token and retry once
    if (error.message.includes('401') || error.message.includes('token')) {
      try {
        const newToken = await refreshPersonalToken();
        // Retry the requests with new token
        // (For simplicity, we'll just return error and let client retry)
      } catch (refreshError) {
        return res.status(500).json({
          error: 'Spotify authentication failed',
          details: refreshError.message
        });
      }
    }

    res.status(500).json({
      error: 'Failed to get player status',
      details: error.message
    });
  }
});

// Get track details by ID (to fetch preview URL if missing)
router.get('/track/:trackId', async (req, res) => {
  try {
    const accessToken = await getValidAccessToken();
    const { trackId } = req.params;

    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.status === 401) {
      try {
        const newToken = await refreshPersonalToken();
        const retryResponse = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
          headers: {
            'Authorization': `Bearer ${newToken}`
          }
        });
        
        if (!retryResponse.ok) {
          throw new Error(`HTTP error! status: ${retryResponse.status}`);
        }
        
        const retryData = await retryResponse.json();
        return res.json({
          success: true,
          track: retryData
        });
      } catch (refreshError) {
        return res.status(500).json({
          error: 'Spotify authentication failed',
          details: refreshError.message
        });
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    res.json({
      success: true,
      track: data
    });

  } catch (error) {
    console.error('Track details error:', error);
    res.status(500).json({
      error: 'Failed to get track details',
      details: error.message
    });
  }
});

// Get user access token for Web Playback SDK (requires streaming scope)
// Note: This endpoint returns the personal access token if it has streaming scope
// For full Web Playback SDK support, users need to authenticate with streaming scope
router.get('/user-token', async (req, res) => {
  try {
    // For now, return the personal access token
    // In production, you'd want to implement proper user OAuth flow
    // with scopes: user-read-playback-state, user-modify-playback-state, streaming
    const accessToken = await getValidAccessToken();
    
    res.json({
      success: true,
      accessToken: accessToken,
      note: 'This token may not have streaming scope. For full Web Playback SDK support, implement user OAuth with streaming scope.'
    });
  } catch (error) {
    console.error('Error getting user token:', error);
    res.status(500).json({
      error: 'Failed to get access token',
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