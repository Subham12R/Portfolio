import React, { useState, useEffect, useCallback, useRef } from 'react'
import { FaPlay, FaSpotify } from 'react-icons/fa'
import { FaPlayCircle, FaPauseCircle, FaForward, FaBackward } from 'react-icons/fa'

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

// Personal Spotify "Now Playing" widget - displays what you're currently listening to
const Spotify = () => {
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)

  // Check actual network connectivity by testing the API
  const checkNetworkStatus = useCallback(async () => {
    // First check navigator.onLine
    if (!navigator.onLine) {
      setIsOnline(false)
      return false
    }

    // Then verify actual connectivity by making a test request
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      
      await fetch(`${API_BASE_URL}/api/spotify/currently-playing`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      // If we get any response (even an error), we're online
      setIsOnline(true)
      return true
    } catch (error) {
      // Network error means we're offline
      if (error.name === 'AbortError' || error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
        setIsOnline(false)
        return false
      }
      // Other errors might mean we're online but API has issues
      setIsOnline(true)
      return true
    }
  }, [])

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = async () => {
      // When browser says online, verify it
      await checkNetworkStatus()
    }
    
    const handleOffline = () => {
      setIsOnline(false)
    }

    // Initial network check
    checkNetworkStatus()

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [checkNetworkStatus])

  // Fetch current track from your Spotify account
  const fetchCurrentTrack = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/spotify/currently-playing`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Update online status based on successful fetch
      setIsOnline(true)
      
      if (data.success) {
        if (data.isPlaying && data.track) {
          setCurrentTrack(data.track)
        } else {
          // If not playing, clear the track
          setCurrentTrack(null)
        }
      } else {
        setCurrentTrack(null)
      }
    } catch (error) {
      console.error('Error fetching current track:', error)
      setCurrentTrack(null)
      
      // Update online status on network errors
      if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
        setIsOnline(false)
      }
    }
  }, [])

  const fetchNowPlaying = useCallback(async () => {
    // Check network status first
    const actuallyOnline = await checkNetworkStatus()
    
    // Don't fetch if offline
    if (!actuallyOnline) {
      setCurrentTrack(null)
      return
    }

    // Silently fetch without showing loading state
    await fetchCurrentTrack()
  }, [checkNetworkStatus, fetchCurrentTrack])

  useEffect(() => {
    // Initial fetch (silently)
    fetchNowPlaying()
    
    // Poll every 30 seconds for live updates (30000 ms)
    const interval = setInterval(fetchNowPlaying, 30000)
    
    // Check network status periodically (every 60 seconds)
    const networkCheckInterval = setInterval(checkNetworkStatus, 60000)
    
    // Also refresh when user focuses the window
    const handleFocus = () => fetchNowPlaying()
    window.addEventListener('focus', handleFocus)
    
    return () => {
      clearInterval(interval)
      clearInterval(networkCheckInterval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchNowPlaying, checkNetworkStatus])

  // Initialize audio when track changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setIsPlaying(false)

    if (currentTrack?.preview_url) {
      const audio = new Audio(currentTrack.preview_url)
      audio.volume = 0.2 // Set to low volume (20%)
      audio.preload = 'auto'
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false)
      })

      audio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e)
        setIsPlaying(false)
      })

      audioRef.current = audio

      return () => {
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current = null
        }
      }
    }
  }, [currentTrack])

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // eslint-disable-next-line no-unused-vars
  const handlePlayPause = () => {
    if (!audioRef.current || !currentTrack?.preview_url) {
      return
    }

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().catch((error) => {
        console.error('Error playing audio:', error)
        setIsPlaying(false)
      })
      setIsPlaying(true)
    }
  }

  if (!isOnline) {
    return (
      <div className='w-full h-full bg-transparent  border shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] border-gray-200 dark:border-zinc-700 rounded-md p-4'>
        <div className='flex items-center gap-2 bg-green-500 p-2 rounded-md'>
          <div className='flex items-center gap-2'>
            <FaSpotify className='text-green-500 bg-green-500 p-2 rounded-md' size={30}/>
            <p className='text-gray-500 dark:text-gray-400 text-sm mb-1'>Offline</p>
          </div>
          <div>
            <p className='text-gray-700 dark:text-gray-300 text-sm'>Unable to fetch music data</p>
          </div>
        </div>
      </div>
    )
  }

  if (!currentTrack) {
    return (
      <div className='w-full h-full bg-green-900/10  border border-green-500/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] rounded-md p-4'>
        <div className='flex items-center gap-2'>
          <FaSpotify className='text-green-500 bg-green-500/10 p-2 rounded-md' size={50} />
          <div>
            <p className='text-gray-500 dark:text-gray-400 text-sm mb-1'>Offline</p>
            <p className='text-gray-400 dark:text-gray-500 text-sm'>Not currently playing</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full h-full bg-transparent border-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] border-gray-200 dark:border-zinc-700 rounded-md p-4 flex justify-between  gap-2'>
      <div className='flex items-center gap-3'>
        <img 
          src={currentTrack.album?.images[2]?.url || currentTrack.album?.images[0]?.url || 'https://picsum.photos/200'} 
          alt={currentTrack.name}
          className='h-16 w-16 rounded object-cover'
        />
        
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 mb-1'>
            <FaSpotify className='text-green-500 animate-pulse' />
            <span className='text-green-500 text-xs font-semibold'>
              Now Playing
            </span>
          </div>
          <p className='text-gray-800 dark:text-gray-200 text-sm font-medium truncate'>{currentTrack.name}</p>
          <p className='text-gray-500 dark:text-gray-400 text-xs truncate'>
            {currentTrack.artists?.map(a => a.name).join(', ')}
          </p>
        </div>
      </div>

      <div className='flex items-center gap-2'>
        {/* <button 
          onClick={handlePlayPause}
          disabled={!currentTrack?.preview_url}
          className='border px-2 py-2 rounded-md shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
          title={currentTrack?.preview_url ? (isPlaying ? 'Pause preview' : 'Play preview') : 'No preview available'}
        >
          {isPlaying ? (
            <FaPauseCircle className='text-gray-500 dark:text-gray-400' />
          ) : (
            <FaPlay className='text-gray-500 dark:text-gray-400' />
          )}
        </button> */}
      </div>
    </div>
  )
}

export default Spotify