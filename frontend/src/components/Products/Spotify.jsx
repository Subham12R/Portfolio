import React, { useState, useEffect, useCallback, useRef } from 'react'
import { FaPlay, FaPause, FaSpotify } from 'react-icons/fa'
import gsap from 'gsap'

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
  const [deviceId, setDeviceId] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [playbackMethod, setPlaybackMethod] = useState('preview'); // 'sdk' or 'preview'
  const audioRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const playerControlsRef = useRef(null);
  const isExpandedRef = useRef(false);
  const spotifyPlayerRef = useRef(null);

  // Load Spotify Web Playback SDK
  useEffect(() => {
    // Check if SDK is already loaded
    if (window.Spotify) {
      setSdkReady(true);
      return;
    }

    // Load the SDK script
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    // Set up the ready callback
    window.onSpotifyWebPlaybackSDKReady = () => {
      setSdkReady(true);
      console.log('Spotify Web Playback SDK is ready');
    };

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Initialize Spotify Web Playback SDK player with owner's token
  useEffect(() => {
    if (!sdkReady || !window.Spotify) return;

    // Initialize player with owner's access token (visitors don't need to authenticate)
    const initPlayer = async () => {
      try {
        // Get owner's access token from backend
        const response = await fetch(`${API_BASE_URL}/api/spotify/user-token`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors'
        });

        let accessToken = null;
        if (response.ok) {
          const data = await response.json();
          accessToken = data.accessToken;
        }

        // If no owner token, we'll use preview URL instead
        if (!accessToken) {
          console.log('No access token available, will use preview URL');
          setPlaybackMethod('preview');
          return;
        }

        // Create player instance - uses owner's token so visitors can listen without auth
        const player = new window.Spotify.Player({
          name: 'Portfolio Music Player',
          getOAuthToken: cb => {
            // Provide owner's token - this allows visitors to listen to owner's music
            cb(accessToken);
          },
          volume: 0.5,
        });

        // Ready event - player is connected and ready
        // Note: Device may not be immediately available in Spotify's API after ready event
        player.addListener('ready', async ({ device_id }) => {
          console.log('Spotify Web Playback SDK ready with Device ID:', device_id);
          setDeviceId(device_id);
          
          // Wait a moment for device to be registered in Spotify's API
          // This helps prevent 404 errors on initial playback attempts
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Verify device is available before marking as ready
          try {
            const checkResponse = await fetch(`${API_BASE_URL}/api/spotify/device/${device_id}/available`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              mode: 'cors'
            });

            if (checkResponse.ok) {
              const data = await checkResponse.json();
              if (data.available) {
                console.log('Device verified as available in Spotify API');
              } else {
                console.log('Device not yet available in Spotify API, will retry on playback');
              }
            }
          } catch (error) {
            console.warn('Could not verify device availability:', error);
          }
          
          setPlaybackMethod('sdk');
        });

        // Not ready event - device went offline
        player.addListener('not_ready', ({ device_id }) => {
          console.log('Spotify device has gone offline:', device_id);
          setDeviceId(null);
        });

        // Player state changed - update UI when playback state changes
        player.addListener('player_state_changed', (state) => {
          if (!state) {
            setIsPlaying(false);
            return;
          }

          setIsPlaying(!state.paused);
          setCurrentTime(state.position / 1000); // Convert from ms to seconds
          setDuration(state.duration / 1000); // Convert from ms to seconds
        });

        // Error handling - fall back to preview on auth errors
        player.addListener('authentication_error', ({ message }) => {
          console.error('Spotify authentication error:', message);
          console.log('Falling back to preview URL playback');
          setPlaybackMethod('preview');
        });

        player.addListener('account_error', ({ message }) => {
          console.error('Spotify account error (Premium required for Web Playback SDK):', message);
          console.log('Falling back to preview URL playback');
          setPlaybackMethod('preview');
        });

        player.addListener('playback_error', ({ message }) => {
          console.error('Spotify playback error:', message);
          // Don't switch to preview on playback errors, just log them
        });

        player.addListener('initialization_error', ({ message }) => {
          console.error('Spotify initialization error:', message);
          setPlaybackMethod('preview');
        });

        // Connect to the player
        const connected = await player.connect();
        
        if (connected) {
          console.log('Connected to Spotify Web Playback SDK');
        } else {
          console.warn('Failed to connect to Spotify Web Playback SDK');
          setPlaybackMethod('preview');
        }

        // Store player reference for cleanup
        spotifyPlayerRef.current = player;
      } catch (error) {
        console.error('Error initializing Spotify player:', error);
        setPlaybackMethod('preview');
      }
    };

    initPlayer();
    
    return () => {
      // Cleanup on unmount
      if (spotifyPlayerRef.current) {
        spotifyPlayerRef.current.disconnect();
        spotifyPlayerRef.current = null;
        setDeviceId(null);
      }
    };
  }, [sdkReady]);

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

  // Try to fetch track details to get preview URL if missing
  const fetchTrackDetails = useCallback(async (trackId) => {
    if (!trackId) return null;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/spotify/track/${trackId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      return data.track;
    } catch (error) {
      console.error('Error fetching track details:', error);
      return null;
    }
  }, []);

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
    
    // Try to get preview URL - first from track, then try fetching track details
    const initializeAudio = async (previewUrl) => {
      if (!previewUrl) return;
      
      const audio = new Audio(previewUrl);
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
    };

    if (track) {
      if (track.preview_url) {
        // Has preview URL, initialize audio
        initializeAudio(track.preview_url);
      } else if (track.id) {
        // No preview URL, try fetching track details
        fetchTrackDetails(track.id).then((trackDetails) => {
          if (trackDetails?.preview_url) {
            // Update player status with the preview URL
            setPlayerStatus(prev => {
              if (prev?.displayTrack?.id === trackDetails.id) {
                return {
                  ...prev,
                  displayTrack: {
                    ...prev.displayTrack,
                    preview_url: trackDetails.preview_url
                  }
                };
              }
              return prev;
            });
            initializeAudio(trackDetails.preview_url);
          }
        });
      }
    }

    return () => {
      if (audioRef.current) {
        const audio = audioRef.current;
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
        audioRef.current = null;
      }
    };
  }, [playerStatus, fetchTrackDetails]);

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

  // Animate player controls sliding down when music plays
  useEffect(() => {
    if (!playerControlsRef.current) return;

    const hasPreview = playerStatus?.displayTrack?.preview_url;
    const hasSDK = playbackMethod === 'sdk' && playerStatus?.displayTrack?.uri;
    const canPlay = hasPreview || hasSDK;
    
    if (isPlaying && canPlay && !isExpandedRef.current) {
      // Slide down when playing starts
      isExpandedRef.current = true;
      gsap.fromTo(
        playerControlsRef.current,
        {
          height: 0,
          opacity: 0,
          y: -10,
        },
        {
          height: 'auto',
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
        }
      );
    } else if (isPlaying && isExpandedRef.current) {
      // Ensure full opacity when playing
      gsap.to(playerControlsRef.current, {
        opacity: 1,
        duration: 0.2,
      });
    }
    // Note: We keep controls expanded when paused so users can see progress
  }, [isPlaying, playerStatus, playbackMethod]);

  // Initialize player controls visibility on track load
  useEffect(() => {
    if (!playerControlsRef.current) return;
    
    const hasPreview = playerStatus?.displayTrack?.preview_url;
    const hasSDK = playbackMethod === 'sdk' && playerStatus?.displayTrack?.uri;
    const canPlay = hasPreview || hasSDK;
    
    if (canPlay) {
      // Start collapsed, will expand when play is clicked
      gsap.set(playerControlsRef.current, {
        height: 0,
        opacity: 0,
        y: -10,
      });
      isExpandedRef.current = false;
    } else {
      // Hide controls if no preview or SDK
      gsap.set(playerControlsRef.current, {
        height: 0,
        opacity: 0,
        y: -10,
      });
      isExpandedRef.current = false;
    }
  }, [playerStatus, playbackMethod]);

  // Wait for device to be available in Spotify's API
  const waitForDeviceAvailability = async (maxRetries = 10, delay = 300) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/spotify/device/${deviceId}/available`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.available) {
            console.log('Device is available in Spotify API');
            return true;
          }
        }

        // Wait before retrying
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.warn(`Device availability check attempt ${i + 1} failed:`, error);
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    console.warn('Device availability check timed out, proceeding anyway');
    return false;
  };

  // Play track using Spotify Web Playback SDK via backend with retry logic
  const playTrackWithSDK = async (trackUri, retryAttempt = 0, maxRetries = 5) => {
    if (!spotifyPlayerRef.current || !deviceId) {
      console.warn('Spotify player not ready');
      return false;
    }

    try {
      // Use backend endpoint to play track (uses owner's token)
      const response = await fetch(`${API_BASE_URL}/api/spotify/play`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId: deviceId,
          trackUri: trackUri,
          retryAttempt: retryAttempt
        }),
        mode: 'cors'
      });

      // Handle retry response (202 with retry flag)
      if (response.status === 202) {
        const data = await response.json();
        if (data.retry && retryAttempt < maxRetries) {
          const retryDelay = data.retryAfter || Math.min(300 * Math.pow(2, retryAttempt), 2000);
          console.log(`Playback retry attempt ${retryAttempt + 1}/${maxRetries} after ${retryDelay}ms`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return await playTrackWithSDK(trackUri, retryAttempt + 1, maxRetries);
        }
        return false;
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        
        // If 401 Unauthorized, log detailed error and don't retry (backend handles refresh)
        if (response.status === 401) {
          console.error('❌ 401 Unauthorized - Playback failed');
          console.error('Error response:', error);
          const errorDetails = error.details || error.error || 'Unknown error';
          console.error('Error details:', errorDetails);
          console.error('');
          console.error('🔍 Troubleshooting steps:');
          console.error('1. Check backend logs for token refresh errors');
          console.error('2. Verify your Spotify token has the "streaming" scope');
          console.error('3. Check /api/spotify/token-diagnostics endpoint');
          console.error('4. Ensure SPOTIFY_REFRESH_TOKEN is valid in backend .env');
          console.error('');
          
          // Try to get diagnostic info automatically
          try {
            const diagResponse = await fetch(`${API_BASE_URL}/api/spotify/token-diagnostics`, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
              mode: 'cors'
            });
            if (diagResponse.ok) {
              const diagnostics = await diagResponse.json();
              console.error('📊 Token Diagnostics:', diagnostics);
              if (diagnostics.refreshToken?.error) {
                console.error('⚠️ Refresh token error:', diagnostics.refreshToken.error);
              }
              if (diagnostics.accessToken?.error) {
                console.error('⚠️ Access token error:', diagnostics.accessToken.error);
              }
            }
          } catch (diagError) {
            console.error('Could not fetch diagnostics:', diagError);
          }
          
          return false;
        }
        
        // If 404 and we haven't retried yet, wait and retry
        if (response.status === 404 && retryAttempt === 0) {
          console.log('Got 404, waiting for device to be ready...');
          await waitForDeviceAvailability(5, 300);
          return await playTrackWithSDK(trackUri, retryAttempt + 1, maxRetries);
        }

        console.error('Failed to play track:', error);
        return false;
      }

      return true;
    } catch (error) {
      // Network error, retry with exponential backoff
      if (retryAttempt < maxRetries) {
        const retryDelay = Math.min(300 * Math.pow(2, retryAttempt), 2000);
        console.log(`Playback error, retrying after ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return await playTrackWithSDK(trackUri, retryAttempt + 1, maxRetries);
      }
      console.error('Error playing track with SDK:', error);
      return false;
    }
  };

  // Handle play/pause
  const handlePlayPause = async () => {
    const track = playerStatus?.displayTrack;
    
    if (!track) {
      console.warn('No track available');
      return;
    }

    // Try Web Playback SDK first if available
    if (playbackMethod === 'sdk' && spotifyPlayerRef.current && deviceId && track.uri) {
      if (isPlaying) {
        // Pause using backend or SDK
        try {
          const response = await fetch(`${API_BASE_URL}/api/spotify/player/control`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'pause',
              deviceId: deviceId
            }),
            mode: 'cors'
          });
          
          if (!response.ok) {
            // Fallback to SDK method
            await spotifyPlayerRef.current.pause();
          }
          setIsPlaying(false);
        } catch (error) {
          console.error('Error pausing:', error);
          // Fallback to SDK method
          try {
            await spotifyPlayerRef.current.pause();
            setIsPlaying(false);
          } catch (sdkError) {
            console.error('SDK pause also failed:', sdkError);
          }
        }
      } else {
        // Play using backend endpoint with retry logic
        setIsLoading(true);
        const success = await playTrackWithSDK(track.uri);
        setIsLoading(false);
        
        if (success) {
          setIsPlaying(true);
          // Wait a moment for playback to start, then update state
          setTimeout(() => {
            if (spotifyPlayerRef.current) {
              spotifyPlayerRef.current.getCurrentState().then(state => {
                if (state) {
                  setIsPlaying(!state.paused);
                  setCurrentTime(state.position / 1000);
                  setDuration(state.duration / 1000);
                }
              }).catch(err => {
                console.warn('Could not get player state:', err);
              });
            }
          }, 500);
        } else {
          // Fallback to preview URL after all retries failed
          console.log('SDK playback failed after retries, falling back to preview URL');
          setPlaybackMethod('preview');
          handlePlayPause(); // Retry with preview
        }
      }
      return;
    }

    // Fallback to preview URL playback
    if (!track.preview_url) {
      console.warn('No preview URL available for this track');
      return;
    }

    if (!audioRef.current) {
      // Try to initialize audio on the fly
      const audio = new Audio(track.preview_url);
      audio.volume = 0.5;
      audio.preload = 'auto';
      
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration || 0);
      });
      
      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration || 0);
      });
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });
      
      audio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        setIsPlaying(false);
      });
      
      audioRef.current = audio;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((error) => {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
        if (audioRef.current) {
          audioRef.current.load();
        }
      });
      setIsPlaying(true);
    }
  };

  // Handle progress bar click
  const handleProgressClick = async (e) => {
    if (!duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    // If using SDK, seek using SDK via backend
    if (playbackMethod === 'sdk' && spotifyPlayerRef.current && deviceId) {
      try {
        const position_ms = Math.floor(newTime * 1000); // Convert to milliseconds
        
        // Use backend endpoint for seeking
        const response = await fetch(`${API_BASE_URL}/api/spotify/player/control`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'seek',
            deviceId: deviceId,
            position_ms: position_ms
          }),
          mode: 'cors'
        });

        if (response.ok) {
          setCurrentTime(newTime);
        } else {
          // Fallback to SDK method
          await spotifyPlayerRef.current.seek(position_ms);
          setCurrentTime(newTime);
        }
      } catch (error) {
        console.error('Error seeking with SDK:', error);
        // Fallback to SDK method directly
        try {
          await spotifyPlayerRef.current.seek(newTime * 1000);
          setCurrentTime(newTime);
        } catch (sdkError) {
          console.error('SDK seek also failed:', sdkError);
        }
      }
      return;
    }
    
    // Fallback to audio element
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Get the current track
  const currentTrack = playerStatus?.displayTrack;
  const trackType = playerStatus?.trackType || 'last_played';
  const isNowPlaying = trackType === 'now_playing';

  // Show loading or empty state
  if (isLoading && !playerStatus) {
    return (
      <div className='w-full h-full bg-transparent border border-gray-200 dark:border-zinc-700 rounded-lg p-4 shadow-[inset_0_0_10px_rgba(0,0,0,0.1)]'>
        <div className='flex items-center gap-3'>
            <div className='h-full w-full rounded bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-500/20 dark:to-green-600/20 flex items-center justify-center shrink-0 animate-pulse'>
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
        {(currentTrack?.preview_url || (playbackMethod === 'sdk' && currentTrack?.uri)) && (
          <div className='flex justify-center mb-2'>
            <button
              onClick={handlePlayPause}
              className='bg-transparent px-2 py-2 border border-zinc-900/20 dark:border-zinc-100/20 rounded-md shadow-[inset_0_0_10px_rgba(0,0,0,0.1)] hover:bg-zinc-900/10 dark:hover:bg-zinc-100/10 transition-all ease-in-out duration-300 flex items-center justify-center gap-2'
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <>
                  <FaPause className='text-zinc-900 dark:text-white' size={18} />
                </>
              ) : (
                <>
                  <FaPlay className='text-zinc-900 dark:text-white' size={18} />
                </>
              )}
            </button>
          </div>
        )}
      </div>

 
      {(currentTrack.preview_url || (playbackMethod === 'sdk' && currentTrack.uri)) && (
        <div 
          ref={playerControlsRef}
          className='overflow-hidden'
          style={{ height: 0, opacity: 0 }}
        >
          <div className='space-y-3 pt-2'>
            {/* Track Title and Artist (duplicate for player section) */}
            <div>
              <p className='text-gray-800 dark:text-gray-200 text-sm font-semibold truncate'>{currentTrack.name}</p>
              <p className='text-gray-500 dark:text-gray-400 text-xs truncate'>
                {currentTrack.artists?.map(a => a.name).join(', ')}
              </p>
            </div>

            {/* Progress Bar */}
            <div className='flex items-center gap-2'>
              <span className='text-xs text-gray-500 dark:text-gray-400 min-w-10 text-right'>
                {formatTime(currentTime)}
              </span>
              <div 
                className='flex-1 h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full cursor-pointer relative group'
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
          </div>
        </div>
      )}


      
    </div>
  );
};

export default Spotify;
