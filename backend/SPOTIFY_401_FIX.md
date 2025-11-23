# Spotify 401 Unauthorized Error Fix

## Problem

Getting 401 Unauthorized errors when attempting to play tracks via the Spotify Web Playback SDK, even though the device is verified as available.

## Root Cause

The access token can expire between:
1. Getting the device ready event
2. Attempting to play a track

Additionally, tokens may need to be refreshed proactively if they're close to expiring.

## Solution

Added comprehensive 401 error handling with automatic token refresh and retry logic:

### 1. Automatic Token Refresh on 401

All endpoints that call Spotify's API now:
- Detect 401 Unauthorized responses
- Automatically refresh the access token
- Retry the request with the new token
- Provide helpful error messages if refresh fails

### 2. Endpoints Updated

- **`/api/spotify/play`** - Play track endpoint
- **`/api/spotify/device/:deviceId/available`** - Device availability check

### 3. Enhanced Error Handling

- Better error messages indicating scope issues if token refresh doesn't help
- Detailed logging for debugging
- Clear distinction between token expiration and missing scopes

## How It Works

```javascript
// When Spotify API returns 401:
1. Detect 401 Unauthorized response
2. Call refreshPersonalToken() to get new token
3. Retry the request with refreshed token
4. If still 401, return helpful error about possible scope issues
```

## Token Refresh Process

The token refresh happens automatically:
1. **Proactive**: `getValidAccessToken()` checks if token expires within 5 minutes
2. **Reactive**: On 401 errors, tokens are refreshed immediately
3. **Caching**: Refreshed tokens are stored and reused until expiration

## Required Scopes

Make sure your token has these scopes for playback to work:
- ✅ `streaming` - **Required for Web Playback SDK**
- ✅ `user-modify-playback-state` - Required to play/pause/seek
- ✅ `user-read-playback-state` - Required to read player state
- ✅ `user-read-currently-playing` - Required to see current track
- ✅ `user-read-recently-played` - Required to see last played track

## Testing

After this fix:
1. Load your portfolio
2. Wait for Spotify component to initialize
3. Click play
4. If token was expired, it will be automatically refreshed
5. Playback should work without 401 errors

## Troubleshooting

### Still getting 401 errors?

1. **Check your refresh token**: Make sure `SPOTIFY_REFRESH_TOKEN` is valid in your `.env`
2. **Check scopes**: Re-authorize with all required scopes (especially `streaming`)
3. **Check backend logs**: Look for token refresh errors in console

### Token refresh fails?

- Verify `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` are correct
- Check that refresh token hasn't been revoked
- Try getting new tokens from Spotify Developer Dashboard

## Code Changes

### Backend (`backend/routes/spotify.js`)

1. Added 401 detection and retry in `/play` endpoint
2. Added 401 handling in device availability check
3. Enhanced error messages for scope issues
4. Improved logging for debugging

### Key Improvements

- ✅ Automatic token refresh on 401
- ✅ Retry logic with refreshed token
- ✅ Better error messages
- ✅ Scope validation hints
- ✅ Comprehensive logging

