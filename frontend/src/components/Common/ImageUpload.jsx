import React, { useState, useEffect } from 'react';
import { FaLink, FaTimes, FaCheck, FaInfoCircle, FaUpload } from 'react-icons/fa';
import apiService from '../../services/api';

const ImageUpload = ({ 
  onImageUpload, 
  currentImage, 
  label = "Image/Video URL",
  className = "",
  onThumbnailUpload = null,
  currentThumbnail = null,
  showThumbnailField = false
}) => {
  const [url, setUrl] = useState(currentImage || '');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  const [thumbnailUrl, setThumbnailUrl] = useState(currentThumbnail || '');
  const [thumbnailError, setThumbnailError] = useState('');
  const [isThumbnailValid, setIsThumbnailValid] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

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

  // Convert YouTube links to embed format
  const convertYouTubeLink = (urlString) => {
    // YouTube formats:
    // Watch: https://www.youtube.com/watch?v=VIDEO_ID
    // Short: https://youtu.be/VIDEO_ID
    // Embed: https://www.youtube.com/embed/VIDEO_ID
    
    let videoId = null;
    
    // Extract from watch URL
    const watchMatch = urlString.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
    if (watchMatch) {
      videoId = watchMatch[1];
    }
    
    // Extract from short URL
    const shortMatch = urlString.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (shortMatch) {
      videoId = shortMatch[1];
    }
    
    // Already embed format
    const embedMatch = urlString.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
    if (embedMatch) {
      return urlString; // Already in embed format
    }
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    return urlString;
  };

  // Get YouTube thumbnail URL
  const getYouTubeThumbnail = (urlString) => {
    let videoId = null;
    
    const watchMatch = urlString.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
    const shortMatch = urlString.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    const embedMatch = urlString.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
    
    videoId = watchMatch?.[1] || shortMatch?.[1] || embedMatch?.[1];
    
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    
    return null;
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
    
    // Check if it's a Google Drive, Imgur, YouTube or other supported host
    const isDriveLink = urlString.includes('drive.google.com');
    const isImgurLink = urlString.includes('imgur.com');
    const isGithubLink = urlString.includes('github.com');
    const isImgbbLink = urlString.includes('imgbb.com');
    const isImgboxLink = urlString.includes('imgbox.com');
    const isYouTubeLink = urlString.includes('youtube.com') || urlString.includes('youtu.be');
    
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
      isImgboxLink ||
      isYouTubeLink
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
    } else if (newUrl.includes('youtube.com') || newUrl.includes('youtu.be')) {
      newUrl = convertYouTubeLink(newUrl);
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

  const handleThumbnailChange = (e) => {
    let newUrl = e.target.value;
    setThumbnailUrl(newUrl);
    setThumbnailError('');
    
    if (newUrl.trim() === '') {
      setIsThumbnailValid(true);
      if (onThumbnailUpload) onThumbnailUpload('');
      return;
    }
    
    // Convert special links
    if (newUrl.includes('drive.google.com')) {
      newUrl = convertDriveLink(newUrl);
      setThumbnailUrl(newUrl);
    } else if (newUrl.includes('imgur.com')) {
      newUrl = convertImgurLink(newUrl);
      setThumbnailUrl(newUrl);
    }
    
    const valid = validateUrl(newUrl);
    setIsThumbnailValid(valid);
    
    if (valid && onThumbnailUpload) {
      onThumbnailUpload(newUrl);
    }
  };

  const handleThumbnailBlur = () => {
    if (thumbnailUrl && !validateUrl(thumbnailUrl)) {
      setThumbnailError('Please enter a valid image URL');
    }
  };

  const removeThumbnail = () => {
    setThumbnailUrl('');
    if (onThumbnailUpload) onThumbnailUpload('');
    setIsThumbnailValid(true);
    setThumbnailError('');
  };

  // Handle thumbnail file upload to Spaces
  const handleThumbnailFileUpload = async (file) => {
    setUploadingThumbnail(true);
    setThumbnailError('');

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      const formData = new FormData();
      formData.append('thumbnail', file);
      
      const response = await apiService.uploadThumbnail(formData);
      
      if (response.success) {
        const cdnUrl = response.data.url;
        setThumbnailUrl(cdnUrl);
        if (onThumbnailUpload) onThumbnailUpload(cdnUrl);
        setIsThumbnailValid(true);
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Thumbnail upload error:', error);
      setThumbnailError(`Upload failed: ${error.message}`);
      setIsThumbnailValid(false);
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleThumbnailFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleThumbnailFileUpload(file);
    }
  };

  useEffect(() => {
    if (currentImage && currentImage !== url) {
      setUrl(currentImage);
      setIsValid(true);
    }
  }, [currentImage]);

  useEffect(() => {
    if (currentThumbnail && currentThumbnail !== thumbnailUrl) {
      setThumbnailUrl(currentThumbnail);
      setIsThumbnailValid(true);
    }
  }, [currentThumbnail]);

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
            <li><strong>Direct URLs:</strong> Any https:// image/video link</li>
            <li><strong>YouTube:</strong> Paste any YouTube video link (watch, share, or embed format)</li>
            <li><strong>Google Drive:</strong> Right-click → Share → "Anyone with the link" → Copy link</li>
            <li><strong>Imgur:</strong> Works with imgur.com links</li>
            <li><strong>GitHub:</strong> Direct image URLs from repositories</li>
          </ul>
          <p className="mt-2 font-semibold">YouTube Tips:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Any YouTube link format works (watch, youtu.be, embed)</li>
            <li>Automatic conversion to embed format</li>
            <li>Thumbnail preview available</li>
          </ul>
          <p className="mt-2 font-semibold">Google Drive Tips:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Must set to "Anyone with the link can view"</li>
            <li>Works best with images (JPG, PNG)</li>
            <li>For videos, consider using YouTube or direct video URLs</li>
          </ul>
        </div>
      )}
      
      {currentImage ? (
        <div className="relative">
          {currentImage.includes('youtube.com') || currentImage.includes('youtu.be') ? (
            <>
              <div className="relative w-full h-48 rounded-lg border border-gray-300 overflow-hidden">
                {getYouTubeThumbnail(currentImage) ? (
                  <img
                    src={getYouTubeThumbnail(currentImage)}
                    alt="YouTube video thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <iframe
                    src={currentImage}
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    title="YouTube video"
                  />
                )}
                <div className="absolute bottom-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                  YouTube
                </div>
              </div>
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </>
          ) : currentImage.startsWith('data:image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(currentImage) || currentImage.includes('drive.google.com') ? (
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
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </>
          ) : (
            <>
              <video
                src={currentImage}
                className="w-full h-48 object-cover rounded-lg border border-gray-300"
                controls
                onError={() => setError('Failed to load video. Check if the link is publicly accessible.')}
              >
                Your browser does not support the video tag.
              </video>
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* URL Input */}
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
              
              {(url.includes('youtube.com') || url.includes('youtu.be')) && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  YouTube link detected. Will be converted to embed format automatically.
                </div>
              )}
              
              <div className="text-xs text-gray-500">
                Paste any image/video URL, Google Drive share link, or YouTube video URL
              </div>
            </div>
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

      {/* Thumbnail Upload Field */}
      {showThumbnailField && onThumbnailUpload && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Thumbnail URL (Optional)
            </label>
          </div>
          
          {currentThumbnail ? (
            <div className="relative">
              <img
                src={currentThumbnail}
                alt="Thumbnail"
                className="w-full h-32 object-cover rounded-lg border border-gray-300"
                onError={(e) => {
                  if (currentThumbnail.includes('drive.google.com') && !currentThumbnail.includes('thumbnail')) {
                    const thumbUrl = getDriveThumbnail(currentThumbnail);
                    if (thumbUrl !== currentThumbnail) {
                      e.target.src = thumbUrl;
                    } else {
                      setThumbnailError('Failed to load thumbnail. Make sure the file is shared publicly.');
                    }
                  } else {
                    setThumbnailError('Failed to load thumbnail. Check if the link is publicly accessible.');
                  }
                }}
              />
              <button
                type="button"
                onClick={removeThumbnail}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* File Upload Option */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailFileSelect}
                  className="hidden"
                  id="thumbnail-file-upload"
                  disabled={uploadingThumbnail}
                />
                <label
                  htmlFor="thumbnail-file-upload"
                  className={`cursor-pointer flex flex-col items-center space-y-2 ${
                    uploadingThumbnail ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-75'
                  }`}
                >
                  {uploadingThumbnail ? (
                    <>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span className="text-sm text-gray-600">Uploading to CDN...</span>
                    </>
                  ) : (
                    <>
                      <FaUpload className="text-3xl text-gray-400" />
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                      </div>
                      <div className="text-xs text-gray-500">
                        PNG, JPG, GIF, WebP up to 5MB
                      </div>
                    </>
                  )}
                </label>
              </div>
              
              <div className="text-center text-xs text-gray-500">OR</div>
              
              {/* URL Input Option */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FaLink className="text-gray-400" />
                  <input
                    type="text"
                    value={thumbnailUrl}
                    onChange={handleThumbnailChange}
                    onBlur={handleThumbnailBlur}
                    placeholder="Or paste thumbnail image URL"
                    disabled={uploadingThumbnail}
                    className={`flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                      thumbnailError 
                        ? 'border-red-500 focus:ring-red-500' 
                        : isThumbnailValid && thumbnailUrl 
                          ? 'border-green-500 focus:ring-green-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {isThumbnailValid && thumbnailUrl && (
                    <FaCheck className="text-green-500 text-xl" />
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  Upload to CDN or paste a direct image URL
                </div>
              </div>
            </div>
          )}
          
          {thumbnailError && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded flex items-start space-x-2 mt-2">
              <FaTimes className="mt-0.5" />
              <span>{thumbnailError}</span>
            </div>
          )}
          
          {isThumbnailValid && thumbnailUrl && currentThumbnail && !thumbnailError && (
            <div className="text-sm text-green-600 bg-green-50 p-2 rounded flex items-center space-x-2 mt-2">
              <FaCheck />
              <span>Thumbnail loaded</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
