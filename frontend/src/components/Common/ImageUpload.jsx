import React, { useState, useEffect } from 'react';
import { FaLink, FaTimes, FaCheck, FaInfoCircle, FaUpload, FaCloud } from 'react-icons/fa';
import apiService from '../../services/api';

const ImageUpload = ({ 
  onImageUpload, 
  currentImage, 
  label = "Image/Video URL",
  accept = "image/*,video/*",
  className = "",
  allowCloudinaryUpload = true
}) => {
  const [url, setUrl] = useState(currentImage || '');
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'cloudinary'

  // Convert Google Drive links to viewable format
  const convertDriveLink = (urlString) => {
    // Google Drive link formats:
    // View: https://drive.google.com/file/d/FILE_ID/view
    // Share: https://drive.google.com/open?id=FILE_ID
    // Direct: https://drive.google.com/uc?export=view&id=FILE_ID
    
    const driveViewMatch = urlString.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    const driveShareMatch = urlString.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    
    if (driveViewMatch) {
      return `https://drive.google.com/uc?export=view&id=${driveViewMatch[1]}`;
    } else if (driveShareMatch) {
      return `https://drive.google.com/uc?export=view&id=${driveShareMatch[1]}`;
    }
    
    return urlString;
  };

  // Alternative Google Drive thumbnail method
  const getDriveThumbnail = (urlString) => {
    const driveViewMatch = urlString.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    const driveShareMatch = urlString.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    
    const fileId = driveViewMatch?.[1] || driveShareMatch?.[1];
    
    if (fileId) {
      // Try thumbnail method as fallback
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    }
    
    return urlString;
  };

  // Convert Imgur links to direct format
  const convertImgurLink = (urlString) => {
    // Imgur: https://imgur.com/xxxxx or https://i.imgur.com/xxxxx.jpg
    if (urlString.includes('imgur.com') && !urlString.includes('i.imgur.com')) {
      const imgurIdMatch = urlString.match(/imgur\.com\/([a-zA-Z0-9]+)/);
      if (imgurIdMatch) {
        return `https://i.imgur.com/${imgurIdMatch[1]}.png`;
      }
    }
    return urlString;
  };

  const validateUrl = (urlString) => {
    if (!urlString || urlString.trim() === '') {
      return true; // Empty is valid (user can clear the field)
    }

    // URL validation regex
    const urlRegex = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;
    
    // Check if URL points to image or video
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i;
    const videoExtensions = /\.(mp4|webm|ogg|mov|avi|mkv)$/i;
    
    // Check if it's a data URL for images
    const isDataUrl = urlString.startsWith('data:image/');
    
    // Check if it's a Google Drive, Imgur, or other supported host
    const isDriveLink = urlString.includes('drive.google.com');
    const isImgurLink = urlString.includes('imgur.com');
    const isGithubLink = urlString.includes('github.com');
    const isImgbbLink = urlString.includes('imgbb.com');
    const isImgboxLink = urlString.includes('imgbox.com');
    
    // Basic URL validation (not strict on extension)
    const hasValidProtocol = urlRegex.test(urlString);
    
    return hasValidProtocol && (
      imageExtensions.test(urlString) || 
      videoExtensions.test(urlString) || 
      isDataUrl ||
      isDriveLink ||
      isImgurLink ||
      isGithubLink ||
      isImgbbLink ||
      isImgboxLink
    );
  };

  const handleUrlChange = (e) => {
    let newUrl = e.target.value;
    setUrl(newUrl);
    setError('');
    
    if (newUrl.trim() === '') {
      setIsValid(true); // Empty is valid
      onImageUpload('');
      return;
    }
    
    // Convert special links
    if (newUrl.includes('drive.google.com')) {
      newUrl = convertDriveLink(newUrl);
      setUrl(newUrl);
    } else if (newUrl.includes('imgur.com')) {
      newUrl = convertImgurLink(newUrl);
      setUrl(newUrl);
    }
    
    const valid = validateUrl(newUrl);
    setIsValid(valid);
    
    if (valid) {
      onImageUpload(newUrl);
    }
  };

  const handleBlur = () => {
    if (url && !validateUrl(url)) {
      setError('Please enter a valid image or video URL');
    }
  };

  const removeImage = () => {
    setUrl('');
    onImageUpload('');
    setIsValid(true);
    setError('');
  };

  // Handle Cloudinary file upload
  const handleCloudinaryUpload = async (file) => {
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      const isVideo = file.type.startsWith('video/');
      
      // Use correct field name and API method based on file type
      if (isVideo) {
        formData.append('video', file);
        const response = await apiService.uploadVideoToCloudinary(formData);
        
        if (response.success) {
          const cloudinaryUrl = response.data.secure_url;
          setUrl(cloudinaryUrl);
          onImageUpload(cloudinaryUrl);
          setIsValid(true);
          setError('');
        } else {
          throw new Error(response.error || 'Upload failed');
        }
      } else {
        formData.append('file', file);
        const response = await apiService.uploadToCloudinary(formData);
        
        if (response.success) {
          const cloudinaryUrl = response.data.secure_url;
          setUrl(cloudinaryUrl);
          onImageUpload(cloudinaryUrl);
          setIsValid(true);
          setError('');
        } else {
          throw new Error(response.error || 'Upload failed');
        }
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      setError(`Upload failed: ${error.message}. Please use a direct image URL instead.`);
      setIsValid(false);
      
      // Show a helpful message about using direct URLs
      setTimeout(() => {
        setError('Upload service unavailable. Please paste a direct image URL (e.g., from Imgur, Google Drive, etc.)');
      }, 2000);
    } finally {
      setUploading(false);
    }
  };

  // Handle file selection for Cloudinary upload
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        setError('Please select an image or video file');
        return;
      }

      // Validate file size (100MB limit for videos, 10MB for images)
      const isVideo = file.type.startsWith('video/');
      const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB for videos, 10MB for images
      
      if (file.size > maxSize) {
        const maxSizeMB = isVideo ? '100MB' : '10MB';
        setError(`File size must be less than ${maxSizeMB}`);
        return;
      }

      handleCloudinaryUpload(file);
    }
  };

  useEffect(() => {
    if (currentImage && currentImage !== url) {
      setUrl(currentImage);
      setIsValid(true);
    }
  }, [currentImage]);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="text-gray-400 hover:text-gray-600"
        >
          <FaInfoCircle />
        </button>
      </div>

      {showHelp && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
          <p className="font-semibold mb-2">Supported Sources:</p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Cloudinary Upload:</strong> Direct file upload with automatic optimization</li>
            <li><strong>Direct URLs:</strong> Any https:// image/video link</li>
            <li><strong>Google Drive:</strong> Right-click → Share → "Anyone with the link" → Copy link</li>
            <li><strong>Imgur:</strong> Works with imgur.com links</li>
            <li><strong>GitHub:</strong> Direct image URLs from repositories</li>
            <li><strong>Formats:</strong> Images (JPG, PNG, GIF, WebP) up to 10MB, Videos (MP4, WebM, MOV) up to 100MB</li>
          </ul>
          <p className="mt-2 font-semibold">Cloudinary Benefits:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Automatic image optimization and resizing</li>
            <li>Reliable CDN delivery</li>
            <li>No external dependencies</li>
            <li>Professional image management</li>
          </ul>
          <p className="mt-2 font-semibold">Google Drive Tips:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Must set to "Anyone with the link can view"</li>
            <li>Works best with images (JPG, PNG)</li>
            <li>May need to use a different hosting service for reliable embedding</li>
          </ul>
        </div>
      )}
      
      {currentImage ? (
        <div className="relative">
          {currentImage.startsWith('data:image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(currentImage) || currentImage.includes('drive.google.com') ? (
            <>
              <img
                src={currentImage}
                alt="Current"
                className="w-full h-48 object-cover rounded-lg border border-gray-300"
                onError={(e) => {
                  // Try fallback for Drive links
                  if (currentImage.includes('drive.google.com') && !currentImage.includes('thumbnail')) {
                    const thumbnailUrl = getDriveThumbnail(currentImage);
                    if (thumbnailUrl !== currentImage) {
                      e.target.src = thumbnailUrl;
                    } else {
                      setError('Failed to load image. Make sure the file is shared publicly and accessible.');
                    }
                  } else {
                    setError('Failed to load image. Check if the link is publicly accessible.');
                  }
                }}
              />
              {currentImage.includes('drive.google.com') && (
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  Google Drive
                </div>
              )}
            </>
          ) : (
            <video
              src={currentImage}
              className="w-full h-48 object-cover rounded-lg border border-gray-300"
              controls
              onError={() => setError('Failed to load video. Check if the link is publicly accessible.')}
            >
              Your browser does not support the video tag.
            </video>
          )}
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
          >
            <FaTimes className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Upload Mode Toggle */}
          {allowCloudinaryUpload && (
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setUploadMode('url')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  uploadMode === 'url'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                <FaLink className="w-4 h-4" />
                <span>URL</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('cloudinary')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  uploadMode === 'cloudinary'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                <FaCloud className="w-4 h-4" />
                <span>Upload</span>
              </button>
            </div>
          )}

          {/* URL Input Mode */}
          {uploadMode === 'url' && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <FaLink className="text-gray-400" />
                <input
                  type="text"
                  value={url}
                  onChange={handleUrlChange}
                  onBlur={handleBlur}
                  placeholder="Enter image/video URL or Google Drive link"
                  className={`flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                    error 
                      ? 'border-red-500 focus:ring-red-500' 
                      : isValid && url 
                        ? 'border-green-500 focus:ring-green-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {isValid && url && (
                  <FaCheck className="text-green-500 text-xl" />
                )}
              </div>
              
              {url.includes('drive.google.com') && (
                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  Google Drive link detected. Ensure the file is shared with "Anyone with the link" permission.
                </div>
              )}
              
              <div className="text-xs text-gray-500">
                Paste any image/video URL or Google Drive share link
              </div>
            </div>
          )}

          {/* Cloudinary Upload Mode */}
          {uploadMode === 'cloudinary' && (
            <div className="space-y-2">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition">
                <input
                  type="file"
                  accept={accept}
                  onChange={handleFileSelect}
                  className="hidden"
                  id="cloudinary-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="cloudinary-upload"
                  className={`cursor-pointer flex flex-col items-center space-y-2 ${
                    uploading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-75'
                  }`}
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span className="text-sm text-gray-600">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <FaUpload className="text-4xl text-gray-400" />
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                      </div>
                      <div className="text-xs text-gray-500">
                        Images: PNG, JPG, GIF, WebP up to 10MB<br/>
                        Videos: MP4, WebM, MOV up to 100MB
                      </div>
                    </>
                  )}
                </label>
              </div>
              
              <div className="text-xs text-gray-500 text-center">
                Files are automatically optimized and stored securely on Cloudinary
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded flex items-start space-x-2">
          <FaTimes className="mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      {isValid && url && currentImage && !error && (
        <div className="text-sm text-green-600 bg-green-50 p-2 rounded flex items-center space-x-2">
          <FaCheck />
          <span>Valid URL loaded</span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
