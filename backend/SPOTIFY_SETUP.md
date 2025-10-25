# Spotify Widget Setup Guide

This guide will help you set up the Spotify "Now Playing" widget for your portfolio.

## Prerequisites

- A Spotify Developer account
- Access to your backend .env file

## Step 1: Create a Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create App"
4. Fill in the details:
   - App name: Your Portfolio
   - App description: Personal portfolio website
   - Website: `https://subham12r.netlify.app`
   - Redirect URI: `https://subham12r.netlify.app/callback`
5. Click "Add" and save your app
6. Copy your **Client ID** and **Client Secret**

## Step 2: Get Your Access Tokens

1. Open your terminal in the `backend` directory
2. Run the token generation script:
   ```bash
   node scripts/get-spotify-tokens.js
   ```
3. Follow the prompts to enter your Client ID and Client Secret
4. The script will generate an authorization URL - copy and paste it into your browser
5. You'll be redirected to `https://subham12r.netlify.app/callback`
6. A page will display your authorization code - click "Copy" to copy it
7. Go back to your terminal and paste the code
8. The script will exchange the code for tokens and display them

## Step 3: Add Tokens to .env

Add the following to your `backend/.env` file:

```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
SPOTIFY_ACCESS_TOKEN=your_access_token_here
SPOTIFY_REFRESH_TOKEN=your_refresh_token_here
SPOTIFY_TOKEN_EXPIRES_AT=timestamp_here
```

## Step 4: Start Your Backend Server

```bash
npm run dev
```

## How It Works

- The access token expires every hour, but the refresh token automatically gets a new one
- The widget polls the API every 10 seconds to show your currently playing track
- If you're not playing anything, it shows your recently played track instead

## Troubleshooting

### Widget shows "Not Playing"
- Make sure Spotify is open and playing music on your device
- Check browser console for errors
- Verify your tokens are correctly set in .env

### Widget shows "Offline"
- Check your internet connection
- The widget only works when online

### API errors
- Check that your tokens haven't expired
- Re-run the token generation script to get new tokens
- Make sure your Spotify app is active in the developer dashboard

## Security Notes

- Never commit your .env file to version control
- The Spotify tokens are stored server-side only
- Visitors to your portfolio don't need authentication to see your currently playing track
