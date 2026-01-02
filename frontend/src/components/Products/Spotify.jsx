import React, { useState, useEffect, useCallback } from 'react'
import { FaSpotify } from 'react-icons/fa'

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

// Personal Spotify "Now Playing" widget - displays what you're currently listening to
const Spotify = () => {
  const [playerStatus, setPlayerStatus] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(false);

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

  // Get the current track
  const currentTrack = playerStatus?.displayTrack;
  const trackType = playerStatus?.trackType || 'last_played';
  const isNowPlaying = trackType === 'now_playing';

  // Get Spotify URL for the track
  const getSpotifyUrl = () => {
    if (!currentTrack) return 'https://open.spotify.com';
    if (currentTrack.external_urls?.spotify) {
      return currentTrack.external_urls.spotify;
    }
    // Fallback: construct URL from track ID
    return `https://open.spotify.com/track/${currentTrack.id}`;
  };

  // Show loading or empty state
  if (isLoading && !playerStatus) {
    return (
      <div className='w-full h-full bg-transparent border border-gray-200 dark:border-zinc-700 rounded-lg p-4 shadow-[inset_0_0_10px_rgba(0,0,0,0.1)]'>
        <div className='flex items-center gap-3'>
          <div className='h-full rounded bg-linear-to-br from-green-500/10 to-green-600/10 dark:from-green-500/20 dark:to-green-600/20 flex items-center justify-center shrink-0 animate-pulse'>
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
          <div className='h-16 w-16 rounded bg-linear-to-br from-green-500/10 to-green-600/10 dark:from-green-500/20 dark:to-green-600/20 flex items-center justify-center shrink-0'>
            <FaSpotify className='text-green-500' size={32} />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-gray-600 dark:text-gray-400 text-sm'>
              {!isOnline ? 'Showing cached data' : 'Not currently playing'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show music player card (clickable to open Spotify)
  return (
    <a
      href={getSpotifyUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className='w-full bg-transparent border border-gray-200 dark:border-zinc-700 rounded-lg p-4 shadow-[inset_0_0_10px_rgba(0,0,0,0.1)] hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all duration-200 cursor-pointer block'
    >
      <div className='flex items-center gap-3'>
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
    </a>
  );
};

export default Spotify;
