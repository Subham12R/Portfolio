# WakaTime OAuth Setup Guide

## Quick Start

You've received the OAuth authorization URL. Here's how to complete the setup:

### Step 1: Update Redirect URI

**Important**: The redirect URI in your WakaTime app settings must match your frontend route.

Your current redirect URI in the URL is: `https://subham12r.netlify.app/callback`

But your frontend route is: `/wakatime/callback`

**You have two options:**

#### Option A: Update WakaTime App Settings (Recommended)
1. Go to https://wakatime.com/apps
2. Edit your OAuth app
3. Change the redirect URI to: `https://subham12r.netlify.app/wakatime/callback`
4. Update your `.env` file:
   ```
   WAKATIME_REDIRECT_URI=https://subham12r.netlify.app/wakatime/callback
   ```

#### Option B: Use `/callback` Route
1. Keep your WakaTime app redirect URI as: `https://subham12r.netlify.app/callback`
2. Update `frontend/src/App.jsx` to handle `/callback` for WakaTime (or create a combined callback handler)

### Step 2: Complete Authorization

1. **Open the authorization URL** in your browser:
   ```
   https://wakatime.com/oauth/authorize?client_id=qVwwPvdjmppkYT9L5NxO8clS&response_type=code&redirect_uri=https%3A%2F%2Fsubham12r.netlify.app%2Fcallback&scope=read_heartbeats%2Cread_summaries.editors%2Cread_summaries.languages&state=3a43da51f5d8595b94dae6955714ec6801e90ec657fd29dbb292d96c954aa473
   ```

2. **Authorize the app** - You'll be redirected back to your callback URL with a `code` parameter

3. **The callback page** will automatically exchange the code for tokens

### Step 3: Verify Setup

Check token status:
```bash
GET /api/wakatime/oauth/status
```

Response should show:
```json
{
  "authorized": true,
  "expires_at": 1234567890,
  "isExpired": false,
  "needsRefresh": false
}
```

## Environment Variables

Make sure these are set in your `backend/.env`:

```env
# WakaTime OAuth (Required for OAuth flow)
WAKATIME_CLIENT_ID=qVwwPvdjmppkYT9L5NxO8clS
WAKATIME_CLIENT_SECRET=your_client_secret_here
WAKATIME_REDIRECT_URI=https://subham12r.netlify.app/wakatime/callback
FRONTEND_URL=https://subham12r.netlify.app

# Optional: Fallback to API key if OAuth not configured
WAKATIME_API_KEY=your_api_key_here
```

## API Endpoints

- `GET /api/wakatime/oauth/authorize` - Get authorization URL
- `POST /api/wakatime/oauth/callback` - Exchange code for tokens
- `GET /api/wakatime/oauth/status` - Check token status
- `POST /api/wakatime/oauth/refresh` - Manually refresh token
- `POST /api/wakatime/oauth/revoke` - Revoke tokens

## Automatic Token Refresh

The system automatically refreshes tokens when they expire (with a 5-minute buffer). No manual intervention needed!

Tokens expire after 365 days (for `response_type=code`), and the refresh token is used automatically.

## Troubleshooting

### "Invalid redirect_uri" Error
- Make sure the redirect URI in your WakaTime app settings exactly matches `WAKATIME_REDIRECT_URI` in your `.env`
- The redirect URI must be HTTPS in production

### "No refresh token available"
- Re-authorize the app to get a new refresh token
- Make sure you're using `response_type=code` (not `token`)

### Tokens not refreshing
- Check that `WAKATIME_CLIENT_SECRET` is set correctly
- Verify the refresh token is stored (check `/api/wakatime/oauth/status`)

