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
    console.log('Token expired or about to expire, refreshing...');
    try {
      const newToken = await refreshPersonalToken();
      console.log('Token refreshed successfully');
      return newToken;
    } catch (error) {
      console.error('Token refresh failed in getValidAccessToken:', error);
      throw error;
    }
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

// Get owner access token for Web Playback SDK (uses owner's token)
// This allows visitors to listen to owner's music without authentication
router.get('/user-token', async (req, res) => {
  try {
    // Return the owner's personal access token for SDK playback
    // This enables visitors to listen to the owner's music using the Web Playback SDK
    const accessToken = await getValidAccessToken();
    
    res.json({
      success: true,
      accessToken: accessToken
    });
  } catch (error) {
    console.error('Error getting user token:', error);
    res.status(500).json({
      error: 'Failed to get access token',
      details: error.message
    });
  }
});

// Check if device is available in Spotify's API
router.get('/device/:deviceId/available', async (req, res) => {
  try {
    const { deviceId } = req.params;
    let accessToken = await getValidAccessToken();

    // Check available devices
    let response = await fetch('https://api.spotify.com/v1/me/player/devices', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });

    // Handle 401 - refresh token and retry
    if (response.status === 401) {
      try {
        accessToken = await refreshPersonalToken();
        response = await fetch('https://api.spotify.com/v1/me/player/devices', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        });
      } catch (refreshError) {
        console.error('Failed to refresh token for device check:', refreshError);
        return res.status(401).json({
          available: false,
          error: 'Authentication failed'
        });
      }
    }

    if (!response.ok) {
      return res.status(response.status).json({
        available: false,
        error: 'Failed to check devices'
      });
    }

    const data = await response.json();
    const device = data.devices?.find(d => d.id === deviceId);

    res.json({
      available: !!device,
      device: device || null
    });

  } catch (error) {
    console.error('Error checking device availability:', error);
    res.status(500).json({
      available: false,
      error: error.message
    });
  }
});

// Play track using owner's token (for Web Playback SDK) with retry logic
router.put('/play', async (req, res) => {
  try {
    const { deviceId, trackUri, retryAttempt = 0 } = req.body;
    
    if (!deviceId || !trackUri) {
      return res.status(400).json({
        error: 'deviceId and trackUri are required'
      });
    }

    const accessToken = await getValidAccessToken();

    // First, verify device is available (with retry on first attempt)
    if (retryAttempt === 0) {
      let deviceCheck = await fetch(`https://api.spotify.com/v1/me/player/devices`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      // Handle 401 - refresh token and retry
      if (deviceCheck.status === 401) {
        try {
          accessToken = await refreshPersonalToken();
          deviceCheck = await fetch(`https://api.spotify.com/v1/me/player/devices`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            }
          });
        } catch (refreshError) {
          console.error('Failed to refresh token for device check:', refreshError);
          return res.status(401).json({
            error: 'Authentication failed',
            details: 'Token refresh failed'
          });
        }
      }

      if (deviceCheck.ok) {
        const devicesData = await deviceCheck.json();
        const device = devicesData.devices?.find(d => d.id === deviceId);
        
        if (!device) {
          // Device not yet registered, wait a bit and retry
          console.log('Device not yet available, waiting...');
          return res.status(202).json({
            success: false,
            retry: true,
            message: 'Device not yet available, please retry',
            retryAfter: 500 // milliseconds
          });
        }
      }
    }

    let response = await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          uris: [trackUri]
        }),
      }
    );

    // Handle 401 Unauthorized - token might be expired, try refreshing
    if (response.status === 401) {
      console.log('Got 401 on playback request, refreshing token and retrying...');
      try {
        const newAccessToken = await refreshPersonalToken();
        console.log('Token refreshed, retrying playback request...');
        
        // Retry with new token
        response = await fetch(
          `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${newAccessToken}`,
            },
            body: JSON.stringify({
              uris: [trackUri]
            }),
          }
        );

        // If still 401 after refresh, there might be a scope issue
        if (response.status === 401) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Still 401 after token refresh. Error details:', errorData);
          return res.status(401).json({
            error: 'Authentication failed',
            details: errorData.error_description || 'Token may not have required scopes (streaming, user-modify-playback-state)'
          });
        }
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        return res.status(401).json({
          error: 'Authentication failed',
          details: `Token refresh failed: ${refreshError.message}. Please check your Spotify credentials and refresh token.`
        });
      }
    }

    if (!response.ok) {
      // If 404 and this is first attempt, suggest retry
      if (response.status === 404 && retryAttempt === 0) {
        return res.status(202).json({
          success: false,
          retry: true,
          message: 'Device not ready, please retry',
          retryAfter: 300 // milliseconds
        });
      }

      const error = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: 'Failed to play track',
        details: error
      });
    }

    res.json({
      success: true,
      message: 'Track playback initiated'
    });

  } catch (error) {
    console.error('Error playing track:', error);
    res.status(500).json({
      error: 'Failed to play track',
      details: error.message
    });
  }
});

// Control playback (pause, resume, seek, volume)
router.put('/player/control', async (req, res) => {
  try {
    const { action, deviceId, position_ms, volume_percent } = req.body;
    
    if (!action) {
      return res.status(400).json({
        error: 'action is required (play, pause, seek, volume)'
      });
    }

    const accessToken = await getValidAccessToken();
    let endpoint = 'https://api.spotify.com/v1/me/player';
    let method = 'PUT';
    let body = {};

    switch (action) {
      case 'play':
        endpoint = `https://api.spotify.com/v1/me/player/play`;
        if (deviceId) endpoint += `?device_id=${deviceId}`;
        break;
      case 'pause':
        endpoint = `https://api.spotify.com/v1/me/player/pause`;
        if (deviceId) endpoint += `?device_id=${deviceId}`;
        break;
      case 'seek':
        if (position_ms === undefined) {
          return res.status(400).json({ error: 'position_ms is required for seek' });
        }
        endpoint = `https://api.spotify.com/v1/me/player/seek?position_ms=${position_ms}`;
        if (deviceId) endpoint += `&device_id=${deviceId}`;
        break;
      case 'volume':
        if (volume_percent === undefined) {
          return res.status(400).json({ error: 'volume_percent is required for volume' });
        }
        endpoint = `https://api.spotify.com/v1/me/player/volume?volume_percent=${volume_percent}`;
        if (deviceId) endpoint += `&device_id=${deviceId}`;
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    const response = await fetch(endpoint, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      ...(Object.keys(body).length > 0 && { body: JSON.stringify(body) })
    });

    if (!response.ok && response.status !== 204) {
      const error = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: `Failed to ${action}`,
        details: error
      });
    }

    res.json({
      success: true,
      message: `${action} successful`
    });

  } catch (error) {
    console.error('Error controlling playback:', error);
    res.status(500).json({
      error: 'Failed to control playback',
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