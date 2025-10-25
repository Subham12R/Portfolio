const express = require('express');
const router = express.Router();

// Spotify API credentials (you'll need to add these to your .env file)
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:5173/callback';

// Store user tokens (in production, use a database)
const userTokens = new Map();

// Get Spotify authorization URL
router.get('/auth-url', (req, res) => {
  const scopes = [
    'user-read-currently-playing',
    'user-read-recently-played',
    'user-top-read',
    'user-read-playback-state'
  ].join(' ');

  const authUrl = `https://accounts.spotify.com/authorize?` +
    `client_id=${SPOTIFY_CLIENT_ID}&` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `show_dialog=true`;

  res.json({ authUrl });
});

// Exchange authorization code for access token
router.post('/callback', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: SPOTIFY_REDIRECT_URI
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error_description || 'Failed to get access token' });
    }

    // Store tokens (in production, store in database with user ID)
    const userId = 'default_user'; // You can use actual user ID from auth
    userTokens.set(userId, {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: Date.now() + (tokenData.expires_in * 1000)
    });

    res.json({ 
      success: true, 
      message: 'Spotify connected successfully',
      expiresIn: tokenData.expires_in 
    });

  } catch (error) {
    console.error('Spotify callback error:', error);
    res.status(500).json({ error: 'Failed to connect to Spotify' });
  }
});

// Refresh access token
async function refreshAccessToken(userId) {
  const userToken = userTokens.get(userId);
  
  if (!userToken || !userToken.refresh_token) {
    throw new Error('No refresh token available');
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
        refresh_token: userToken.refresh_token
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error_description || 'Failed to refresh token');
    }

    // Update stored tokens
    userTokens.set(userId, {
      access_token: data.access_token,
      refresh_token: data.refresh_token || userToken.refresh_token, // Keep old refresh token if not provided
      expires_at: Date.now() + (data.expires_in * 1000)
    });

    return data.access_token;

  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
}

// Get valid access token (refresh if needed)
async function getValidAccessToken(userId) {
  const userToken = userTokens.get(userId);
  
  if (!userToken) {
    throw new Error('No Spotify token found. Please authenticate first.');
  }

  // Check if token is expired (with 5 minute buffer)
  if (Date.now() >= userToken.expires_at - 300000) {
    console.log('Token expired, refreshing...');
    return await refreshAccessToken(userId);
  }

  return userToken.access_token;
}

// Get currently playing track
router.get('/currently-playing', async (req, res) => {
  try {
    const userId = 'default_user'; // You can get this from auth middleware
    const accessToken = await getValidAccessToken(userId);

    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.status === 204) {
      // No content - user not playing anything
      return res.json({ 
        success: true, 
        isPlaying: false, 
        message: 'No track currently playing' 
      });
    }

    if (response.status === 401) {
      // Token expired, try to refresh
      try {
        const newToken = await refreshAccessToken(userId);
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
        return res.status(401).json({ 
          error: 'Spotify authentication expired. Please reconnect.',
          needsReauth: true 
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

// Get user's top tracks
router.get('/top-tracks', async (req, res) => {
  try {
    const userId = 'default_user';
    const accessToken = await getValidAccessToken(userId);

    const response = await fetch('https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=5', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.status === 401) {
      return res.status(401).json({ 
        error: 'Spotify authentication expired. Please reconnect.',
        needsReauth: true 
      });
    }

    const data = await response.json();
    
    res.json({ 
      success: true, 
      tracks: data.items 
    });

  } catch (error) {
    console.error('Top tracks error:', error);
    res.status(500).json({ 
      error: 'Failed to get top tracks',
      details: error.message 
    });
  }
});

// Check if user is authenticated
router.get('/status', (req, res) => {
  const userId = 'default_user';
  const userToken = userTokens.get(userId);
  
  if (!userToken) {
    return res.json({ 
      authenticated: false, 
      message: 'Not connected to Spotify' 
    });
  }

  const isExpired = Date.now() >= userToken.expires_at - 300000;
  
  res.json({ 
    authenticated: true, 
    isExpired,
    expiresAt: userToken.expires_at 
  });
});

module.exports = router;
