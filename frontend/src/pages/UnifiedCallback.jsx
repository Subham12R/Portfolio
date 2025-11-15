import React from 'react'
import { useSearchParams } from 'react-router-dom'
import SpotifyCallback from './SpotifyCallback'
import WakaTimeCallback from './WakaTimeCallback'

// Unified callback handler that detects Spotify vs WakaTime
const UnifiedCallback = () => {
  const [searchParams] = useSearchParams()
  
  const state = searchParams.get('state')
  const code = searchParams.get('code')
  const service = searchParams.get('service') // Optional service parameter
  
  // Check referrer to detect source
  const referrer = document.referrer || ''
  const isFromSpotify = referrer.includes('accounts.spotify.com') || referrer.includes('spotify.com')
  const isFromWakaTime = referrer.includes('wakatime.com')
  
  // WakaTime states are long hex strings (64 chars), Spotify doesn't use state
  const hasWakaTimeState = state && state.length > 40
  
  // Determine service
  let isWakaTime = false
  
  if (service === 'wakatime') {
    isWakaTime = true
  } else if (service === 'spotify') {
    isWakaTime = false
  } else if (hasWakaTimeState || isFromWakaTime) {
    isWakaTime = true
  } else if (isFromSpotify) {
    isWakaTime = false
  } else if (code && !state) {
    // If we have a code but no state, default to WakaTime (auto-exchanges)
    // User can manually visit /callback?service=spotify if needed
    isWakaTime = true
  }
  
  if (isWakaTime) {
    return <WakaTimeCallback />
  }
  
  return <SpotifyCallback />
}

export default UnifiedCallback

