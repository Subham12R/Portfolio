# WakaTime OAuth - Simple Setup

## Quick Setup (3 Steps)

### 1. Get Authorization URL
```bash
GET /api/wakatime/oauth/authorize
```

### 2. Authorize
Open the `authUrl` from the response in your browser and authorize.

### 3. Done!
The callback automatically exchanges the code for tokens. Real-time data fetching starts immediately.

## That's It!

After authorization:
- ✅ Tokens are stored automatically
- ✅ Real-time data fetching works immediately  
- ✅ Tokens refresh automatically when expired
- ✅ No manual steps needed

## Exchange Your Code

If you have an authorization code, visit:
```
https://subham12r.netlify.app/callback?code=YOUR_CODE_HERE
```

Or make a POST request:
```bash
POST /api/wakatime/oauth/callback
Content-Type: application/json

{ "code": "YOUR_CODE_HERE" }
```

## Environment Variables

Required in `backend/.env`:
```env
WAKATIME_CLIENT_ID=your_client_id
WAKATIME_CLIENT_SECRET=your_client_secret
WAKATIME_REDIRECT_URI=https://subham12r.netlify.app/callback
FRONTEND_URL=https://subham12r.netlify.app
```

## Check Status

```bash
GET /api/wakatime/oauth/status
```
