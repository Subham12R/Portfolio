const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  console.log('Upload test endpoint hit');
  res.json({ message: 'Upload route is working', timestamp: new Date().toISOString() });
});

// Validate image/video URL
const validateUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  // URL validation regex
  const urlRegex = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;
  
  // Check if URL points to image or video
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i;
  const videoExtensions = /\.(mp4|webm|ogg|mov|avi|mkv)$/i;
  
  // Check if it's a data URL for images
  const isDataUrl = url.startsWith('data:image/');
  
  // Check if it's a YouTube URL
  const isYouTubeUrl = url.includes('youtube.com/watch') || 
                       url.includes('youtu.be/') || 
                       url.includes('youtube.com/embed/');
  
  return urlRegex.test(url) && (imageExtensions.test(url) || videoExtensions.test(url) || isDataUrl || isYouTubeUrl);
};

// Validate image/video URL endpoint
router.post('/validate-url', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        error: 'URL is required',
        valid: false
      });
    }
    
    const isValid = validateUrl(url);
    
    if (isValid) {
      res.json({
        message: 'URL is valid',
        valid: true,
        url: url
      });
    } else {
      res.status(400).json({
        error: 'Invalid URL. Must be a valid image or video URL.',
        valid: false
      });
    }
  } catch (error) {
    console.error('URL validation error:', error);
    res.status(500).json({ 
      error: 'Failed to validate URL',
      valid: false
    });
  }
});

module.exports = router;
