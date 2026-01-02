import React, { useState, useEffect, useCallback, useRef } from 'react'
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
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

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
        // If no preview_url, try to fetch track details to get it
        if (!data.displayTrack.preview_url && data.displayTrack.id) {
          try {
            const trackResponse = await fetch(`${API_BASE_URL}/api/spotify/track/${data.displayTrack.id}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              mode: 'cors'
            });
            if (trackResponse.ok) {
              const trackData = await trackResponse.json();
              if (trackData.success && trackData.track?.preview_url) {
                data.displayTrack.preview_url = trackData.track.preview_url;
              }
            }
          } catch (e) {
            console.log('Could not fetch track preview URL:', e);
          }
        }
        
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

  // Setup audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      console.error('Audio playback error');
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, []);

  // Get the current track
  const currentTrack = playerStatus?.displayTrack;
  const trackType = playerStatus?.trackType || 'last_played';
  const isNowPlaying = trackType === 'now_playing';

  // Reset audio when track changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [currentTrack?.id]);

  // Get Spotify URL for the track
  const getSpotifyUrl = () => {
    if (!currentTrack) return 'https://open.spotify.com';
    if (currentTrack.external_urls?.spotify) {
      return currentTrack.external_urls.spotify;
    }
    // Fallback: construct URL from track ID
    return `https://open.spotify.com/track/${currentTrack.id}`;
  };

  // Format time in MM:SS
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Fetch YouTube audio URL
  const fetchYouTubeAudio = async () => {
    if (!currentTrack) return null;
    
    const songName = currentTrack.name || '';
    const artistName = currentTrack.artists?.map(a => a.name).join(' ') || '';
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/spotify/youtube-audio?song=${encodeURIComponent(songName)}&artist=${encodeURIComponent(artistName)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch audio');
      }
      
      const data = await response.json();
      return data.audioUrl;
    } catch (error) {
      console.error('Error fetching YouTube audio:', error);
      return null;
    }
  };

  // Handle audio play/pause
  const handlePlayPause = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!audioRef.current) return;

    // If already playing, just pause
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    // If we have a source, play it
    if (audioRef.current.src && audioRef.current.src !== window.location.href) {
      audioRef.current.play().catch(error => {
        console.error('Playback error:', error);
      });
      setIsPlaying(true);
      return;
    }

    // Try Spotify preview first
    if (currentTrack?.preview_url) {
      audioRef.current.src = currentTrack.preview_url;
      audioRef.current.play().catch(error => {
        console.error('Playback error:', error);
      });
      setIsPlaying(true);
      return;
    }

    // Fallback: fetch from YouTube
    setIsLoadingAudio(true);
    const youtubeAudioUrl = await fetchYouTubeAudio();
    setIsLoadingAudio(false);
    
    if (youtubeAudioUrl) {
      audioRef.current.src = youtubeAudioUrl;
      audioRef.current.play().catch(error => {
        console.error('Playback error:', error);
      });
      setIsPlaying(true);
    } else {
      console.log('No audio source available');
    }
  };

  // Handle progress slider change
  const handleSliderChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!audioRef.current) return;
    
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
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

  // Show music player card
  return (
    <div className='w-full bg-transparent border border-gray-200 dark:border-zinc-700 rounded-lg p-4 shadow-[inset_0_0_10px_rgba(0,0,0,0.1)] hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all duration-200'>
      <div className='flex items-center gap-3'>
        {/* Album art */}
        <div className='relative h-16 w-16 shrink-0'>
          <img 
            src={currentTrack.album?.images[2]?.url || currentTrack.album?.images[0]?.url || 'https://picsum.photos/200'} 
            alt={currentTrack.name}
            className='h-16 w-16 rounded object-cover'
          />
          {/* Show playing indicator */}
          {isPlaying && (
            <div className='absolute bottom-1 right-1 flex items-center gap-0.5'>
              <span className='w-0.5 h-2 bg-green-500 rounded-full animate-pulse'></span>
              <span className='w-0.5 h-3 bg-green-500 rounded-full animate-pulse' style={{animationDelay: '0.2s'}}></span>
              <span className='w-0.5 h-2 bg-green-500 rounded-full animate-pulse' style={{animationDelay: '0.4s'}}></span>
            </div>
          )}
        </div>
        
        {/* Track info */}
        <a
          href={getSpotifyUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className='flex-1 min-w-0 cursor-pointer'
        >
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
        </a>

        {/* Glass-style Play button */}
        <button
          onClick={handlePlayPause}
          disabled={isLoadingAudio}
          className='shrink-0 w-10 h-10 flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10 hover:scale-105 active:scale-95'
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoadingAudio ? (
            <svg className='w-5 h-5 text-gray-600 dark:text-gray-300 animate-spin' fill='none' viewBox='0 0 24 24'>
              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
              <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
            </svg>
          ) : isPlaying ? (
            <svg className='w-5 h-5 text-gray-600 dark:text-gray-300' fill='currentColor' viewBox='0 0 20 20'>
              <rect x='5' y='3' width='3' height='14' rx='1' />
              <rect x='12' y='3' width='3' height='14' rx='1' />
            </svg>
          ) : (
            <svg className='w-5 h-5 text-gray-600 dark:text-gray-300 ml-0.5' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z' />
            </svg>
          )}
        </button>
      </div>

      {/* Progress bar - show when has audio source */}
      {(isPlaying || currentTime > 0 || duration > 0) && (
        <div className='mt-3 pt-3 border-t border-gray-200 dark:border-zinc-700'>
          <div className='flex items-center gap-2'>
            <span className='text-xs text-gray-500 dark:text-gray-400 shrink-0 w-8'>
              {formatTime(currentTime)}
            </span>
            
            <input
              type='range'
              min='0'
              max={duration || 30}
              value={currentTime}
              onChange={handleSliderChange}
              className='flex-1 h-1.5 rounded-lg appearance-none cursor-pointer'
              style={{
                background: `linear-gradient(to right, #22c55e 0%, #22c55e ${duration ? (currentTime / duration) * 100 : 0}%, #52525b ${duration ? (currentTime / duration) * 100 : 0}%, #52525b 100%)`
              }}
            />

            <span className='text-xs text-gray-500 dark:text-gray-400 shrink-0 w-8 text-right'>
              {formatTime(duration)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Spotify;
