const express = require('express');
const axios = require('axios');
const router = express.Router();

// Twitter OEmbed API - No authentication required!
const TWITTER_OEMBED_BASE = 'https://publish.twitter.com/oembed';

// Get Twitter timeline embed using OEmbed API
router.get('/tweets', async (req, res) => {
  try {
    // Get query parameters
    const username = (req.query.username || req.query.user || '').trim();

    if (!username) {
      return res.status(400).json({ 
        success: false,
        error: 'Twitter username is required. Use ?username=YOUR_USERNAME' 
      });
    }

    // Clean username (remove @ if present)
    const cleanUsername = username.replace(/^@/, '').trim();
    
    // Basic validation
    if (cleanUsername.length === 0 || cleanUsername.length > 15) {
      return res.status(400).json({
        success: false,
        error: `Invalid Twitter username. Must be 1-15 characters.`,
        username: cleanUsername
      });
    }

    console.log(`Fetching Twitter timeline for username: ${cleanUsername}`);

    // Create Twitter profile URL
    const twitterUrl = `https://twitter.com/${encodeURIComponent(cleanUsername)}`;
    
    // Fetch OEmbed data
    const oembedUrl = `${TWITTER_OEMBED_BASE}?url=${encodeURIComponent(twitterUrl)}`;
    
    console.log(`OEmbed URL: ${oembedUrl}`);
    
    const response = await axios.get(oembedUrl, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json'
      }
    });

    const data = response.data;

    // OEmbed returns HTML that can be directly embedded
    res.json({
      success: true,
      html: data.html || '',
      author_name: data.author_name || cleanUsername,
      author_url: data.author_url || twitterUrl,
      width: data.width || null,
      height: data.height || null,
      type: data.type || 'rich',
      cache_age: data.cache_age || null,
      provider_name: data.provider_name || 'Twitter',
      provider_url: data.provider_url || 'https://twitter.com',
      version: data.version || '1.0',
      url: twitterUrl,
      username: cleanUsername
    });

  } catch (error) {
    console.error('❌ Twitter OEmbed error:', error.message);
    
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data || {};
      
      if (status === 404) {
        return res.status(404).json({
          success: false,
          error: `Twitter profile not found: ${username}`,
          details: 'Please verify the username exists and is spelled correctly.'
        });
      }
      
      if (status === 401 || status === 403) {
        return res.status(status).json({
          success: false,
          error: 'Twitter OEmbed access denied',
          details: errorData.error || errorData.message
        });
      }

      return res.status(status).json({
        success: false,
        error: 'Twitter OEmbed error',
        details: errorData.error || errorData.message || error.message
      });
    }

    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch Twitter timeline',
      details: error.message || 'Unknown error occurred'
    });
  }
});

// Get embed for a specific tweet URL
router.get('/tweet', async (req, res) => {
  try {
    const tweetUrl = req.query.url;

    if (!tweetUrl) {
      return res.status(400).json({ 
        success: false,
        error: 'Twitter tweet URL is required. Use ?url=https://twitter.com/username/status/123456' 
      });
    }

    // Validate it's a Twitter URL
    if (!tweetUrl.includes('twitter.com') && !tweetUrl.includes('x.com')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Twitter URL. Must be a twitter.com or x.com URL.'
      });
    }

    console.log(`Fetching Twitter tweet embed for: ${tweetUrl}`);

    // Fetch OEmbed data
    const oembedUrl = `${TWITTER_OEMBED_BASE}?url=${encodeURIComponent(tweetUrl)}`;
    
    const response = await axios.get(oembedUrl, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json'
      }
    });

    const data = response.data;

    res.json({
      success: true,
      html: data.html || '',
      author_name: data.author_name || '',
      author_url: data.author_url || '',
      width: data.width || null,
      height: data.height || null,
      type: data.type || 'rich',
      cache_age: data.cache_age || null,
      provider_name: data.provider_name || 'Twitter',
      provider_url: data.provider_url || 'https://twitter.com',
      version: data.version || '1.0',
      url: tweetUrl
    });

  } catch (error) {
    console.error('❌ Twitter OEmbed error:', error.message);
    
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data || {};
      
      return res.status(status).json({
        success: false,
        error: 'Twitter OEmbed error',
        details: errorData.error || errorData.message || error.message
      });
    }

    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch Twitter tweet embed',
      details: error.message || 'Unknown error occurred'
    });
  }
});

// Health check endpoint
router.get('/status', (req, res) => {
  res.json({ 
    status: 'ok',
    configured: true,
    method: 'OEmbed API (No authentication required)',
    endpoint: TWITTER_OEMBED_BASE
  });
});

module.exports = router;
