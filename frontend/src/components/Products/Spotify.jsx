import React, { useState, useEffect, useCallback, useRef } from 'react'
import { FaPlay, FaPause, FaSpotify } from 'react-icons/fa'

// API Base URL - Use production URL by default
// For local development, set VITE_API_URL in .env file
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Default to production URL
  return 'https://portfolio-ea4s.onrender.com';
};

const API_BASE_URL = getApiBaseUrl();

// Cache keys for localStorage
const CACHE_KEYS = {
  PLAYER_STATUS: 'spotify_player_status',
  CACHE_TIMESTAMP: 'spotify_cache_timestamp'
};

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

// Format time in MM:SS format
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Personal Spotify "Now Playing" widget - displays what you're currently listening to
const Spotify = () => {
  const [playerStatus, setPlayerStatus] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Load cached data from localStorage
  const loadCachedData = useCallback(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.PLAYER_STATUS);
      const timestamp = localStorage.getItem(CACHE_KEYS.CACHE_TIMESTAMP);
      
      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp);
        if (age < CACHE_DURATION) {
          const data = JSON.parse(cached);
          return data;
        }
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
    return null;
  }, []);

  // Save data to localStorage
  const saveCachedData = useCallback((data) => {
    try {
      localStorage.setItem(CACHE_KEYS.PLAYER_STATUS, JSON.stringify(data));
      localStorage.setItem(CACHE_KEYS.CACHE_TIMESTAMP, Date.now().toString());
    } catch (error) {
      console.error('Error saving cached data:', error);
    }
  }, []);

  // Check actual network connectivity by testing the API
  const checkNetworkStatus = useCallback(async () => {
    // First check navigator.onLine
    if (!navigator.onLine) {
      setIsOnline(false);
      return false;
    }

    // Then verify actual connectivity by making a test request
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      await fetch(`${API_BASE_URL}/api/spotify/player-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // If we get any response (even an error), we're online
      setIsOnline(true);
      return true;
    } catch (error) {
      // Network error means we're offline
      if (error.name === 'AbortError' || error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
        setIsOnline(false);
        return false;
      }
      // Other errors might mean we're online but API has issues
      setIsOnline(true);
      return true;
    }
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = async () => {
      // When browser says online, verify it
      await checkNetworkStatus();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    // Initial network check
    checkNetworkStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkNetworkStatus]);

  // Fetch player status (now playing + last played)
  const fetchPlayerStatus = useCallback(async () => {
    // Check network status first
    const actuallyOnline = await checkNetworkStatus();
    
    // If offline, load from cache
    if (!actuallyOnline) {
      const cached = loadCachedData();
      if (cached) {
        setPlayerStatus(cached);
        return;
      }
      setPlayerStatus(null);
      return;
    }

    // Fetch from API
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/spotify/player-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update online status based on successful fetch
      setIsOnline(true);
      
      if (data.success && data.displayTrack) {
        setPlayerStatus(data);
        // Cache the data
        saveCachedData(data);
      } else {
        // If no track, try to load from cache
        const cached = loadCachedData();
        if (cached) {
          setPlayerStatus(cached);
        } else {
          setPlayerStatus(null);
        }
      }
    } catch (error) {
      console.error('Error fetching player status:', error);
      
      // On error, try to load from cache
      const cached = loadCachedData();
      if (cached) {
        setPlayerStatus(cached);
      } else {
        setPlayerStatus(null);
      }
      
      // Update online status on network errors
      if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
        setIsOnline(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [checkNetworkStatus, loadCachedData, saveCachedData]);

  // Initial load: try cache first, then fetch
  useEffect(() => {
    // Load from cache immediately for instant display
    const cached = loadCachedData();
    if (cached) {
      setPlayerStatus(cached);
    }
    
    // Then fetch fresh data
    fetchPlayerStatus();
    
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchPlayerStatus, 30000);
    
    // Check network status periodically (every 60 seconds)
    const networkCheckInterval = setInterval(checkNetworkStatus, 60000);
    
    // Also refresh when user focuses the window
    const handleFocus = () => fetchPlayerStatus();
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      clearInterval(networkCheckInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchPlayerStatus, checkNetworkStatus, loadCachedData]);

  // Initialize audio when track changes
  useEffect(() => {
    // Store references to event handlers for cleanup
    let updateProgressHandler = null;
    let handleLoadedMetadataHandler = null;
    let handleAudioEndedHandler = null;
    let handleErrorHandler = null;
    
    // Cleanup previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    const track = playerStatus?.displayTrack;
    if (track?.preview_url) {
      const audio = new Audio(track.preview_url);
      audio.volume = 0.5; // Set to 50% volume
      audio.preload = 'auto';
      
      updateProgressHandler = () => {
        if (audio) {
          setCurrentTime(audio.currentTime);
          setDuration(audio.duration || 0);
        }
      };

      handleLoadedMetadataHandler = () => {
        setDuration(audio.duration || 0);
      };

      handleAudioEndedHandler = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      handleErrorHandler = (e) => {
        console.error('Audio playback error:', e);
        setIsPlaying(false);
      };

      audio.addEventListener('timeupdate', updateProgressHandler);
      audio.addEventListener('loadedmetadata', handleLoadedMetadataHandler);
      audio.addEventListener('ended', handleAudioEndedHandler);
      audio.addEventListener('error', handleErrorHandler);

      audioRef.current = audio;

      return () => {
        if (audio) {
          audio.pause();
          if (updateProgressHandler) {
            audio.removeEventListener('timeupdate', updateProgressHandler);
          }
          if (handleLoadedMetadataHandler) {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadataHandler);
          }
          if (handleAudioEndedHandler) {
            audio.removeEventListener('ended', handleAudioEndedHandler);
          }
          if (handleErrorHandler) {
            audio.removeEventListener('error', handleErrorHandler);
          }
        }
        if (audioRef.current) {
          audioRef.current = null;
        }
      };
    }
  }, [playerStatus]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Handle play/pause
  const handlePlayPause = () => {
    if (!audioRef.current || !playerStatus?.displayTrack?.preview_url) {
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((error) => {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  };

  // Handle progress bar click
  const handleProgressClick = (e) => {
    if (!audioRef.current || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Get the current track
  const currentTrack = playerStatus?.displayTrack;
  const trackType = playerStatus?.trackType || 'last_played';
  const isNowPlaying = trackType === 'now_playing';

  // Show loading or empty state
  if (isLoading && !playerStatus) {
    return (
      <div className='w-full bg-transparent border border-gray-200 dark:border-zinc-700 rounded-lg p-4 shadow-[inset_0_0_10px_rgba(0,0,0,0.1)]'>
        <div className='flex items-center gap-3'>
            <div className='h-16 w-16 rounded bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-500/20 dark:to-green-600/20 flex items-center justify-center shrink-0 animate-pulse'>
            <FaSpotify className='text-green-500' size={32} />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-gray-600 dark:text-gray-400 text-sm'>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show offline/empty state
  if (!currentTrack) {
    return (
      <div className='w-full bg-transparent border border-gray-200 dark:border-zinc-700 rounded-lg p-4 shadow-[inset_0_0_10px_rgba(0,0,0,0.1)]'>
        <div className='flex items-center gap-3'>
          <div className='h-16 w-16 rounded bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-500/20 dark:to-green-600/20 flex items-center justify-center shrink-0'>
            <FaSpotify className='text-green-500' size={32} />
          </div>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 mb-1'>
              <span className='text-gray-500 dark:text-gray-400 text-xs font-medium'>
                {!isOnline ? 'Offline' : 'No track available'}
              </span>
            </div>
            <p className='text-gray-600 dark:text-gray-400 text-sm'>
              {!isOnline ? 'Showing cached data' : 'Not currently playing'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show music player
  return (
    <div className='w-full bg-transparent border border-gray-200 dark:border-zinc-700 rounded-lg p-4 shadow-[inset_0_0_10px_rgba(0,0,0,0.1)]'>
      {/* Top Section: Album Art and Track Info */}
      <div className='flex items-center gap-3 mb-4'>
        <img 
          src={currentTrack.album?.images[2]?.url || currentTrack.album?.images[0]?.url || 'https://picsum.photos/200'} 
          alt={currentTrack.name}
          className='h-16 w-16 rounded object-cover shrink-0'
        />
        
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 mb-1'>
            <FaSpotify className={`text-green-500 ${isNowPlaying ? 'animate-pulse' : ''}`} size={14} />
            <span className={`text-xs font-semibold ${isNowPlaying ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}`}>
              {isNowPlaying ? 'Now Playing' : 'Last Played'}
            </span>
            {!isOnline && (
              <span className='text-xs text-gray-400 dark:text-gray-500'>(Offline)</span>
            )}
          </div>
          <p className='text-gray-800 dark:text-gray-200 text-sm font-medium truncate'>{currentTrack.name}</p>
          <p className='text-gray-500 dark:text-gray-400 text-xs truncate'>
            {currentTrack.artists?.map(a => a.name).join(', ')}
          </p>
        </div>
      </div>

      {/* Bottom Section: Player Controls */}
      <div className='space-y-2'>
        {/* Track Title and Artist (duplicate for player section) */}
        <div>
          <p className='text-gray-800 dark:text-gray-200 text-sm font-semibold truncate'>{currentTrack.name}</p>
          <p className='text-gray-500 dark:text-gray-400 text-xs truncate'>
            {currentTrack.artists?.map(a => a.name).join(', ')}
          </p>
        </div>

        {/* Progress Bar */}
        {currentTrack.preview_url && (
          <>
            <div className='flex items-center gap-2'>
              <span className='text-xs text-gray-500 dark:text-gray-400 min-w-10 text-right'>
                {formatTime(currentTime)}
              </span>
              <div 
                className='flex-1 h-1 bg-gray-200 dark:bg-zinc-700 rounded-full cursor-pointer relative group'
                onClick={handleProgressClick}
              >
                <div 
                  className='h-full bg-green-500 rounded-full transition-all'
                  style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                />
                <div 
                  className='absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
                  style={{ left: duration ? `${(currentTime / duration) * 100}%` : '0%', transform: 'translate(-50%, -50%)' }}
                />
              </div>
              <span className='text-xs text-gray-500 dark:text-gray-400 min-w-10'>
                {formatTime(duration)}
              </span>
            </div>

            {/* Play/Pause Button */}
            <div className='flex justify-center pt-2'>
              <button
                onClick={handlePlayPause}
                disabled={!currentTrack.preview_url}
                className='bg-transparent px-4 py-2 border border-zinc-900/20 dark:border-zinc-100/20 rounded-md shadow-[inset_0_0_10px_rgba(0,0,0,0.1)] hover:bg-zinc-900/10 dark:hover:bg-zinc-100/10 transition-all ease-in-out duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isPlaying ? (
                  <FaPause className='text-zinc-900 dark:text-white' size={16} />
                ) : (
                  <FaPlay className='text-zinc-900 dark:text-white' size={16} />
                )}
              </button>
            </div>
          </>
        )}

        {!currentTrack.preview_url && (
          <p className='text-xs text-gray-400 dark:text-gray-500 text-center py-2'>
            Preview not available for this track
          </p>
        )}
      </div>
    </div>
  );
};

export default Spotify;
