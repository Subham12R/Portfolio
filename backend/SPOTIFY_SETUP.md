# Spotify Integration Setup Guide

This guide explains how to set up the Spotify integration so visitors can listen to your music without authentication.

## Overview

The Spotify component allows visitors to your portfolio to listen to:
- **Currently playing track** - What you're listening to right now
- **Last played track** - What you listened to most recently

Visitors **do not need to authenticate** - they listen using your Spotify account's token.

## Prerequisites

1. **Spotify Premium Account** - Required for Web Playback SDK
2. **Spotify Developer Account** - Create an app at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)

## Setup Steps

### 1. Create Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click "Create an app"
3. Fill in app details:
   - **App name**: Portfolio Music Player (or any name)
   - **App description**: Portfolio music player component
   - **Redirect URI**: `https://subham12r.netlify.app/callback` (or your callback URL)
4. Save your **Client ID** and **Client Secret**

### 2. Get Access Token with Required Scopes

You need to get an access token with these scopes:
- `user-read-currently-playing` - Read currently playing track
- `user-read-recently-played` - Read recently played tracks
- `user-read-playback-state` - Read playback state
- `user-modify-playback-state` - Control playback (play/pause/seek)
- `streaming` - **Required for Web Playback SDK**

#### Option A: Using the provided HTML file (Easiest)

1. Open `backend/spotify-auth.html` in your browser
2. Enter your Client ID and Client Secret
3. Click "Generate Auth URL"
4. Authorize the app with all required scopes
5. Copy the authorization code and get your tokens
6. Add the tokens to your `.env` file

#### Option B: Manual Setup

1. Create an authorization URL with required scopes:
```
https://accounts.spotify.com/authorize?
  client_id=YOUR_CLIENT_ID&
  response_type=code&
  redirect_uri=YOUR_REDIRECT_URI&
  scope=user-read-currently-playing%20user-read-recently-played%20user-read-playback-state%20user-modify-playback-state%20streaming&
  show_dialog=true
```

2. Open the URL in your browser and authorize
3. Copy the `code` from the redirect URL
4. Exchange the code for tokens:
```bash
curl -X POST https://accounts.spotify.com/api/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Authorization: Basic BASE64(CLIENT_ID:CLIENT_SECRET)" \
  -d "grant_type=authorization_code" \
  -d "code=YOUR_CODE" \
  -d "redirect_uri=YOUR_REDIRECT_URI"
```

### 3. Configure Environment Variables

Add these to your `.env` file in the backend directory:

```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
SPOTIFY_ACCESS_TOKEN=your_access_token_here
SPOTIFY_REFRESH_TOKEN=your_refresh_token_here
SPOTIFY_TOKEN_EXPIRES_AT=timestamp_when_token_expires
```

**Note**: The `SPOTIFY_TOKEN_EXPIRES_AT` is optional - the system will refresh tokens automatically.

### 4. How It Works

#### For Visitors (No Authentication Required)
- Visitors can see what music you're currently playing or last played
- They can click play to listen using the **Web Playback SDK** (if you have Premium)
- Falls back to **30-second preview** if SDK is unavailable
- All playback uses your Spotify account token

#### Backend Endpoints

- `GET /api/spotify/player-status` - Get currently playing or last played track
- `GET /api/spotify/user-token` - Get owner's access token (for SDK)
- `PUT /api/spotify/play` - Play a track (uses owner's token)
- `PUT /api/spotify/player/control` - Control playback (pause, resume, seek, volume)

#### Frontend Component

The `Spotify.jsx` component:
1. Loads the Spotify Web Playback SDK
2. Gets owner's token from backend
3. Initializes player with owner's token
4. Shows track info and playback controls
5. Falls back to preview URL if SDK fails

## Important Notes

### Token Refresh

The backend automatically refreshes your access token when it expires. Make sure your `SPOTIFY_REFRESH_TOKEN` is set in `.env`.

### Web Playback SDK Requirements

- **Spotify Premium** is required for Web Playback SDK
- If you don't have Premium, the component will automatically fall back to preview URLs (30-second previews)

### Scopes

Make sure your token includes all required scopes:
- ✅ `streaming` - **Critical** for Web Playback SDK
- ✅ `user-read-currently-playing`
- ✅ `user-read-recently-played`
- ✅ `user-read-playback-state`
- ✅ `user-modify-playback-state`

If you get authentication errors, you may need to re-authorize with all scopes.

## Troubleshooting

### "Failed to authenticate" error
- Check that your tokens are valid
- Ensure token has `streaming` scope
- Try re-authorizing with all required scopes

### "Account error" in SDK
- You need a Spotify Premium account for Web Playback SDK
- The component will automatically fall back to preview URLs

### No music playing
- Check that you're currently playing music or have recently played music
- Verify your tokens are valid: `GET /api/spotify/status`
- Check browser console for errors

### Playback not working
- Ensure you have Spotify Premium (for SDK)
- Check that token has `streaming` scope
- Verify backend is running and tokens are configured

## Testing

1. Start your backend server
2. Check Spotify status: `GET http://localhost:5000/api/spotify/status`
3. Load your portfolio frontend
4. The Spotify component should show your currently playing or last played track
5. Click play to test playback

## Security Note

The owner's Spotify token is stored securely in environment variables on the backend. Visitors never see or need the token - all API calls go through your backend.

