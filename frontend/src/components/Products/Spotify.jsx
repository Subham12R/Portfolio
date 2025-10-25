import React, { useState, useEffect } from 'react'
import { FaSpotify } from 'react-icons/fa'

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://portfolio-ea4s.onrender.com';

// Personal Spotify "Now Playing" widget - displays what you're currently listening to
const Spotify = () => {
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Fetch current track from your Spotify account
  const fetchCurrentTrack = async () => {
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
      
      if (data.success) {
        if (data.isPlaying && data.track) {
          setCurrentTrack(data.track)
          setIsPlaying(true)
        } else {
          // If not playing, try to get recently played
          await fetchRecentlyPlayed()
        }
      }
    } catch (error) {
      console.error('Error fetching current track:', error)
      setCurrentTrack(null)
      setIsPlaying(false)
    }
  }

  // Fetch recently played track as fallback
  const fetchRecentlyPlayed = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/spotify/recently-played`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.track) {
          setCurrentTrack(data.track)
          setIsPlaying(false) // Recently played, not currently playing
        }
      }
    } catch (error) {
      console.error('Error fetching recently played:', error)
    }
  }

  const fetchNowPlaying = async () => {
    // Don't fetch if offline
    if (!isOnline) {
      setCurrentTrack(null)
      setIsPlaying(false)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    await fetchCurrentTrack()
    setIsLoading(false)
  }

  useEffect(() => {
    // Initial fetch
    fetchNowPlaying()
    
    // Poll every 10 seconds for live updates
    const interval = setInterval(fetchNowPlaying, 10000)
    
    // Also refresh when user focuses the window
    const handleFocus = () => fetchNowPlaying()
    window.addEventListener('focus', handleFocus)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  if (isLoading) {
    return (
      <div className='w-full h-full bg-transparent border-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] border-gray-200 dark:border-zinc-700 rounded-md p-4'>
        <div className='flex items-center gap-2 text-gray-500 dark:text-gray-400'>
          <FaSpotify className='text-green-500 animate-pulse' />
          <p className='text-sm'>Loading Spotify...</p>
        </div>
      </div>
    )
  }

  if (!isOnline) {
    return (
      <div className='w-full h-full bg-transparent border-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] border-gray-200 dark:border-zinc-700 rounded-md p-4'>
        <div className='flex items-center gap-2'>
          <FaSpotify className='text-gray-400' size={30}/>
          <div>
            <p className='text-gray-500 dark:text-gray-400 text-sm mb-1'>Offline</p>
            <p className='text-gray-700 dark:text-gray-300 text-sm'>Unable to fetch music data</p>
          </div>
        </div>
      </div>
    )
  }

  if (!currentTrack) {
    return (
      <div className='w-full h-full bg-transparent border-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] border-gray-200 dark:border-zinc-700 rounded-md p-4'>
        <div className='flex items-center gap-2'>
          <FaSpotify className='text-green-500' size={30} />
          <div className='ml-1'>
            <p className='text-gray-500 dark:text-gray-400 text-sm mb-2'>Not Playing</p>
            <p className='text-gray-400 dark:text-gray-500 text-sm'>No music detected</p>
            <p className='text-gray-400 dark:text-gray-500 text-sm'>Start playing on Spotify</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full h-full bg-transparent border-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] border-gray-200 dark:border-zinc-700 rounded-md p-4'>
      <div className='flex items-center gap-3'>
        <img 
          src={currentTrack.album?.images[2]?.url || currentTrack.album?.images[0]?.url || 'https://picsum.photos/200'} 
          alt={currentTrack.name}
          className='h-16 w-16 rounded object-cover'
        />
        
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 mb-1'>
            {isPlaying ? (
              <FaSpotify className='text-green-500 animate-pulse' />
            ) : (
              <FaSpotify className='text-green-500' />
            )}
            <span className='text-green-500 text-xs font-semibold'>
              {isPlaying ? 'Now Playing' : 'Recently Played'}
            </span>
          </div>
          <p className='text-gray-800 dark:text-gray-200 text-sm font-medium truncate'>{currentTrack.name}</p>
          <p className='text-gray-500 dark:text-gray-400 text-xs truncate'>
            {currentTrack.artists?.map(a => a.name).join(', ')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Spotify