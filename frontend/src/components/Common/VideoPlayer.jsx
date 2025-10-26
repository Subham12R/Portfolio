"use client";

import { AnimatePresence,motion, useSpring } from "framer-motion";
import { Play, Plus } from "lucide-react";
import {
  MediaControlBar,
  MediaController,
  MediaMuteButton,
  MediaPlayButton,
  MediaSeekBackwardButton,
  MediaSeekForwardButton,
  MediaTimeDisplay,
  MediaTimeRange,
  MediaVolumeRange,
} from "media-chrome/react";
// import type { ComponentProps } from "react"; // TypeScript syntax not needed in JSX
import React, { useState } from "react";

import { cn } from "../../lib/utils";

export const VideoPlayer = ({ style, ...props }) => (
  <MediaController
    style={{
      ...style,
    }}
    {...props}
  />
);

export const VideoPlayerControlBar = (props) => (
  <MediaControlBar {...props} />
);

export const VideoPlayerTimeRange = ({
  className,
  ...props
}) => (
  <MediaTimeRange
    className={cn(
      "[--media-range-thumb-opacity:0] [--media-range-track-height:2px]",
      className,
    )}
    {...props}
  />
);

export const VideoPlayerTimeDisplay = ({
  className,
  ...props
}) => (
  <MediaTimeDisplay className={cn("p-2.5", className)} {...props} />
);

export const VideoPlayerVolumeRange = ({
  className,
  ...props
}) => (
  <MediaVolumeRange className={cn("p-2.5", className)} {...props} />
);

export const VideoPlayerPlayButton = ({
  className,
  ...props
}) => (
  <MediaPlayButton className={cn("", className)} {...props} />
);

export const VideoPlayerSeekBackwardButton = ({
  className,
  ...props
}) => (
  <MediaSeekBackwardButton className={cn("p-2.5", className)} {...props} />
);

export const VideoPlayerSeekForwardButton = ({
  className,
  ...props
}) => (
  <MediaSeekForwardButton className={cn("p-2.5", className)} {...props} />
);

export const VideoPlayerMuteButton = ({
  className,
  ...props
}) => (
  <MediaMuteButton className={cn("", className)} {...props} />
);

export const VideoPlayerContent = ({
  className,
  ...props
}) => (
  <video className={cn("mb-0 mt-0", className)} {...props} />
);

export const ProjectMediaPlayer = ({ 
  mediaUrl, 
  mediaType = 'image', 
  alt = 'Project media',
  className = '',
  projectId = null
}) => {
  const [showVideoPopOver, setShowVideoPopOver] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const SPRING = {
    mass: 0.1,
  };

  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);
  const opacity = useSpring(0, SPRING);

  const handlePointerMove = (e) => {
    opacity.set(1);
    const bounds = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - bounds.left);
    y.set(e.clientY - bounds.top);
  };

  // Convert Google Drive links to proper format
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

  // Generate fallback URLs based on project ID for consistency
  const getFallbackImageUrl = () => {
    if (projectId) {
      return `https://picsum.photos/800/400?random=${projectId}`;
    }
    return 'https://picsum.photos/800/400';
  };

  const getFallbackVideoUrl = () => {
    // Using a sample video URL - you can replace with your own fallback video
    return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  };

  // Check if URL is a Google Drive link
  const isGoogleDriveLink = mediaUrl?.includes('drive.google.com');
  
  // Determine if this should be treated as video
  const isVideo = mediaType === 'video' || mediaUrl?.includes('.mp4') || mediaUrl?.includes('.webm') || mediaUrl?.includes('.mov');
  
  // Get the actual media URL to use (with fallbacks)
  const getActualMediaUrl = () => {
    if (isVideo) {
      if (videoError || !mediaUrl) {
        return getFallbackVideoUrl();
      }
      return mediaUrl;
    } else {
      if (imageError || !mediaUrl) {
        return getFallbackImageUrl();
      }
      return mediaUrl;
    }
  };

  const actualMediaUrl = getActualMediaUrl();

  return (
    <>
      <div
        onMouseMove={handlePointerMove}
        onMouseLeave={() => {
          opacity.set(0);
        }}
        onClick={() => setShowVideoPopOver(true)}
        className={`relative cursor-pointer group ${className}`}
      >
        <motion.div
          style={{ x, y, opacity }}
          className="absolute z-20 flex w-fit select-none items-center justify-center gap-2 p-2 text-sm text-white mix-blend-exclusion pointer-events-none"
        >
          <Play className="size-4 fill-white" /> 
          {isVideo ? 'Play' : 'View'}
        </motion.div>
        
        {isVideo ? (
          isGoogleDriveLink ? (
            <iframe
              src={mediaUrl}
              className="h-full w-full object-cover"
              frameBorder="0"
              allowFullScreen
              onError={() => setVideoError(true)}
              title={alt}
            />
          ) : (
            <video
              autoPlay
              muted
              playsInline
              loop
              className="h-full w-full object-cover"
              onError={() => setVideoError(true)}
            >
              <source src={actualMediaUrl} />
            </video>
          )
        ) : (
          <img
            src={isGoogleDriveLink ? convertDriveLink(mediaUrl) : actualMediaUrl}
            alt={alt}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        )}
      </div>

      <AnimatePresence>
        {showVideoPopOver && (
          <VideoPopOver 
            setShowVideoPopOver={setShowVideoPopOver} 
            mediaUrl={actualMediaUrl}
            isVideo={isVideo}
            alt={alt}
          />
        )}
      </AnimatePresence>
    </>
  );
};

const VideoPopOver = ({
  setShowVideoPopOver,
  mediaUrl,
  isVideo,
  alt
}) => {
  // Convert Google Drive links to proper format
  const convertDriveLink = (urlString) => {
    const driveViewMatch = urlString.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    const driveShareMatch = urlString.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    
    if (driveViewMatch) {
      return `https://drive.google.com/uc?export=view&id=${driveViewMatch[1]}`;
    } else if (driveShareMatch) {
      return `https://drive.google.com/uc?export=view&id=${driveShareMatch[1]}`;
    }
    
    return urlString;
  };

  // Check if URL is a Google Drive link
  const isGoogleDriveLink = mediaUrl?.includes('drive.google.com');
  return (
    <div className="fixed left-0 top-0 z-101 flex h-screen w-screen items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-background/90 absolute left-0 top-0 h-full w-full backdrop-blur-lg"
        onClick={() => setShowVideoPopOver(false)}
      ></motion.div>
      <motion.div
        initial={{ clipPath: "inset(43.5% 43.5% 33.5% 43.5% )", opacity: 0 }}
        animate={{ clipPath: "inset(0 0 0 0)", opacity: 1 }}
        exit={{
          clipPath: "inset(43.5% 43.5% 33.5% 43.5% )",
          opacity: 0,
          transition: {
            duration: 1,
            type: "spring",
            stiffness: 100,
            damping: 20,
            opacity: { duration: 0.2, delay: 0.8 },
          },
        }}
        transition={{
          duration: 1,
          type: "spring",
          stiffness: 100,
          damping: 20,
        }}
        className="relative aspect-video max-w-7xl"
      >
        {isVideo ? (
          isGoogleDriveLink ? (
            <div className="relative w-full h-full">
              <iframe
                src={mediaUrl}
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
                title={alt}
              />
              <span
                onClick={() => setShowVideoPopOver(false)}
                className="absolute right-2 top-2 z-10 cursor-pointer rounded-full p-1 transition-colors bg-black/50"
              >
                <Plus className="size-5 rotate-45 text-white" />
              </span>
            </div>
          ) : (
            <VideoPlayer style={{ width: "100%", height: "100%" }}>
              <VideoPlayerContent
                src={mediaUrl}
                autoPlay
                slot="media"
                className="w-full object-cover"
                style={{ width: "100%", height: "100%" }}
              />

              <span
                onClick={() => setShowVideoPopOver(false)}
                className="absolute right-2 top-2 z-10 cursor-pointer rounded-full p-1 transition-colors"
              >
                <Plus className="size-5 rotate-45 text-white" />
              </span>
              <VideoPlayerControlBar className="absolute bottom-0 left-1/2 flex w-full max-w-7xl -translate-x-1/2 items-center justify-center px-5 mix-blend-exclusion md:px-10 md:py-5">
                <VideoPlayerPlayButton className="h-4 bg-transparent" />
                <VideoPlayerTimeRange className="bg-transparent" />
                <VideoPlayerMuteButton className="size-4 bg-transparent" />
              </VideoPlayerControlBar>
            </VideoPlayer>
          )
        ) : (
          <div className="relative w-full h-full">
            <img
              src={isGoogleDriveLink ? convertDriveLink(mediaUrl) : mediaUrl}
              alt={alt}
              className="w-full h-full object-contain"
            />
            <span
              onClick={() => setShowVideoPopOver(false)}
              className="absolute right-2 top-2 z-10 cursor-pointer rounded-full p-1 transition-colors bg-black/50"
            >
              <Plus className="size-5 rotate-45 text-white" />
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
};
