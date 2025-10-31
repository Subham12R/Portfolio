import React, { useState, useEffect, useCallback } from 'react'
import { FaSpotify } from 'react-icons/fa'

// API Base URL - Use apiService for consistency
import apiService from '../../services/api';

// Get API base URL from apiService
const API_BASE_URL = apiService.baseURL || 'https://portfolio-ea4s.onrender.com';

// Personal Spotify "Now Playing" widget - displays what you're currently listening to
const Spotify = () => {
  const [currentTrack, setCurrentTrack] = useState(null)
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
    }
  }

  const fetchNowPlaying = useCallback(async () => {
    // Don't fetch if offline
    if (!isOnline) {
      setCurrentTrack(null)
      return
    }

    // Silently fetch without showing loading state
    await fetchCurrentTrack()
  }, [isOnline])

  useEffect(() => {
    // Initial fetch (silently)
    fetchNowPlaying()
    
    // Poll every 30 seconds for live updates (30000 ms)
    const interval = setInterval(fetchNowPlaying, 30000)
    
    // Also refresh when user focuses the window
    const handleFocus = () => fetchNowPlaying()
    window.addEventListener('focus', handleFocus)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchNowPlaying])

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
    <div className='w-full h-full bg-transparent border-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] border-gray-200 dark:border-zinc-700 rounded-md p-4'>
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
    </div>
  )
}

export default Spotify