const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
console.log('Cloudinary configuration check:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
  api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing'
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer with memory storage (simpler approach)
const storage = multer.memoryStorage();

// Image upload configuration
const imageUpload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for images
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Video upload configuration with larger limits
const videoUpload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  }
});

// General upload configuration (supports both images and videos)
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for general uploads
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'), false);
    }
  }
});

// Helper function to upload images to Cloudinary
const uploadToCloudinary = (fileBuffer, folder = 'portfolio-images') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        auto_orient: true,
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    
    uploadStream.end(fileBuffer);
  });
};

// Helper function to upload videos to Cloudinary
const uploadVideoToCloudinary = (fileBuffer, folder = 'portfolio-videos') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'video',
        allowed_formats: ['mp4', 'webm', 'mov', 'avi', 'mkv'],
        chunk_size: 6000000, // 6MB chunks for better upload performance
        eager: [
          { width: 800, height: 600, crop: 'limit' },
          { width: 400, height: 300, crop: 'limit' }
        ],
        eager_async: true
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    
    uploadStream.end(fileBuffer);
  });
};

module.exports = { 
  cloudinary, 
  upload, 
  imageUpload, 
  videoUpload, 
  uploadToCloudinary, 
  uploadVideoToCloudinary 
};
