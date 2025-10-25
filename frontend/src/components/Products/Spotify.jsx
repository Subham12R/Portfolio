import React, { useState, useEffect } from 'react'
import { FaSpotify } from 'react-icons/fa'

// Spotify component - Real API integration

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

  // Simplified Spotify integration - only for active music
  const checkSpotifyAuth = async () => {
    try {
      // Check if user is already authenticated
      const statusResponse = await fetch('https://portfolio-fqur.vercel.app/api/spotify/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      })
      
      if (!statusResponse.ok) {
        throw new Error(`HTTP error! status: ${statusResponse.status}`)
      }
      
      const statusData = await statusResponse.json()
      
      if (statusData.authenticated) {
        // User is authenticated, fetch current track
        await fetchCurrentTrack()
      } else {
        // Not authenticated, show connect button
        setCurrentTrack(null)
        setIsPlaying(false)
      }
    } catch (error) {
      console.error('Spotify auth check error:', error)
      setCurrentTrack(null)
      setIsPlaying(false)
    }
  }

  const fetchCurrentTrack = async () => {
    try {
      const response = await fetch('https://portfolio-fqur.vercel.app/api/spotify/currently-playing', {
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
          setCurrentTrack(null)
          setIsPlaying(false)
        }
      } else if (data.needsReauth) {
        // Token expired, need to re-authenticate
        setCurrentTrack(null)
        setIsPlaying(false)
      }
    } catch (error) {
      console.error('Error fetching current track:', error)
      setCurrentTrack(null)
      setIsPlaying(false)
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
    
    // Check Spotify authentication and fetch current track
    await checkSpotifyAuth()
    setIsLoading(false)
  }

  useEffect(() => {
    // Check for Spotify OAuth callback
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    
    if (code) {
      // Handle OAuth callback
      handleSpotifyCallback(code)
    } else {
      // Normal flow - check auth and fetch
      fetchNowPlaying()
    }
    
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

  // Handle Spotify OAuth callback
  const handleSpotifyCallback = async (code) => {
    try {
      setIsLoading(true)
      
      const response = await fetch('https://portfolio-fqur.vercel.app/api/spotify/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname)
        // Fetch current track
        await fetchCurrentTrack()
      } else {
        console.error('Spotify callback error:', data.error)
        alert('Failed to connect to Spotify. Please try again.')
      }
    } catch (error) {
      console.error('Spotify callback error:', error)
      alert('Failed to connect to Spotify. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className='w-full h-full bg-transparent border-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] border-gray-200 rounded-md p-4'>
        <div className='flex items-center gap-2 text-gray-500'>
          <FaSpotify className='text-green-500 animate-pulse' />
          <p className='text-sm'>Loading Spotify...</p>
        </div>
      </div>
    )
  }


  // Show connect button if not authenticated
  if (!currentTrack && isOnline && !isLoading) {
    return (
      <div className='w-full h-full bg-transparent border-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] border-gray-200 rounded-md p-4'>
        <div className='flex items-center gap-2'>
          <FaSpotify className='text-gray-400' size={30}/>
          <div className='ml-1'>
            <p className='text-gray-500 text-sm mb-2'>Connect to Spotify</p>
            <p className='text-gray-400 text-sm mb-2'>Click to connect your Spotify account</p>
            <button 
              onClick={async () => {
                try {
                  const response = await fetch('https://portfolio-fqur.vercel.app/api/spotify/auth-url')
                  const data = await response.json()
                  if (data.authUrl) {
                    // Redirect to Spotify OAuth
                    window.location.href = data.authUrl
                  } else {
                    alert('Failed to get Spotify auth URL')
                  }
                } catch (error) {
                  console.error('Error getting auth URL:', error)
                  alert('Failed to connect to Spotify. Please try again.')
                }
              }}
              className='px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors'
            >
              Connect Spotify
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!currentTrack) {
    return (
      <div className='w-full h-full bg-transparent border-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] border-gray-200 rounded-md p-4'>
        <div className='flex items-center gap-2'>
          {isOnline ? (
            <>
              <FaSpotify className='text-green-500 ' size={30} />
              <div className='ml-1'>
                <p className='text-gray-500 text-sm mb-2'>Not Playing</p>
                <p className='text-gray-400 text-sm'>No track currently playing</p>
                <p className='text-gray-400 text-sm'>Start playing music on Spotify</p>
              </div>
            </>
          ) : (
            <>
              <FaSpotify className='text-gray-400' size={30}/>
              <div>
                <p className='text-gray-500 text-sm mb-1'>Offline</p>
                <p className='text-gray-700 text-sm'>User is offline</p>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className='w-full h-full bg-transparent border-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] border-gray-200 rounded-md p-4'>
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
          <p className='text-gray-800 text-sm font-medium truncate'>{currentTrack.name}</p>
          <p className='text-gray-500 text-xs truncate'>
            {currentTrack.artists?.map(a => a.name).join(', ')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Spotify