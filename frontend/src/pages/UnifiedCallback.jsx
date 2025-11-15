import React from 'react'
import { useSearchParams } from 'react-router-dom'
import SpotifyCallback from './SpotifyCallback'
import WakaTimeCallback from './WakaTimeCallback'

// Unified callback handler that detects Spotify vs WakaTime
const UnifiedCallback = () => {
  const [searchParams] = useSearchParams()
  
  // Check if this is a WakaTime callback
  // WakaTime typically includes state parameter and specific scopes
  const state = searchParams.get('state')
  const code = searchParams.get('code')
  
  // If state is present and looks like a WakaTime state (long hex string), it's likely WakaTime
  // Otherwise, default to Spotify
  const isWakaTime = state && state.length > 40 // WakaTime states are 64-char hex strings
  
  if (isWakaTime) {
    return <WakaTimeCallback />
  }
  
  return <SpotifyCallback />
}

export default UnifiedCallback

