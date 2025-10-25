const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { upload, uploadToCloudinary } = require('../config/cloudinary');

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
  
  return urlRegex.test(url) && (imageExtensions.test(url) || videoExtensions.test(url) || isDataUrl);
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

// Upload file to Cloudinary
router.post('/cloudinary', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded',
        success: false
      });
    }

    console.log('Uploading file to Cloudinary:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'portfolio-images');
    
    console.log('Cloudinary upload successful:', {
      public_id: result.public_id,
      secure_url: result.secure_url,
      format: result.format,
      width: result.width,
      height: result.height
    });

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        public_id: result.public_id,
        secure_url: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        created_at: result.created_at
      }
    });

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload file to Cloudinary',
      success: false,
      details: error.message
    });
  }
});

// Delete file from Cloudinary
router.delete('/cloudinary/:publicId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({ 
        error: 'Public ID is required',
        success: false
      });
    }

    const { cloudinary } = require('../config/cloudinary');
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'File deleted successfully',
        public_id: publicId
      });
    } else {
      res.status(400).json({
        error: 'Failed to delete file',
        success: false,
        details: result.result
      });
    }

  } catch (error) {
    console.error('Cloudinary delete error:', error);
    res.status(500).json({ 
      error: 'Failed to delete file from Cloudinary',
      success: false,
      details: error.message
    });
  }
});

// Upload resume PDF
router.post('/resume', authenticateToken, requireAdmin, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No resume file uploaded',
        success: false
      });
    }

    // Check if it's a PDF
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ 
        error: 'Only PDF files are allowed for resume',
        success: false
      });
    }

    console.log('Uploading resume to Cloudinary:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Upload to Cloudinary with specific folder for resume
    const result = await uploadToCloudinary(req.file.buffer, 'portfolio-resume');
    
    console.log('Resume upload successful:', {
      public_id: result.public_id,
      secure_url: result.secure_url
    });

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        public_id: result.public_id,
        secure_url: result.secure_url,
        filename: req.file.originalname
      }
    });

  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload resume',
      success: false,
      details: error.message
    });
  }
});

// Get resume download URL (public endpoint)
router.get('/resume', async (req, res) => {
  try {
    const { cloudinary } = require('../config/cloudinary');
    
    // Search for the most recent resume in the portfolio-resume folder
    const result = await cloudinary.search
      .expression('folder:portfolio-resume')
      .sort_by([['created_at', 'desc']])
      .max_results(1)
      .execute();
    
    if (result.resources && result.resources.length > 0) {
      const resume = result.resources[0];
      res.json({
        success: true,
        download_url: resume.secure_url,
        filename: resume.public_id.split('/').pop() + '.pdf'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'No resume found'
      });
    }

  } catch (error) {
    console.error('Resume download error:', error);
    res.status(500).json({ 
      error: 'Failed to get resume',
      success: false,
      details: error.message
    });
  }
});

module.exports = router;
