# Vercel Deployment Guide

## Backend Deployment Fix

### 1. **Vercel Configuration**
The project now has proper Vercel configuration:
- `vercel.json` - Main configuration
- `api/index.js` - Serverless function entry point
- `backend/vercel.json` - Backend-specific config

### 2. **Environment Variables to Set in Vercel Dashboard**

Go to your Vercel project dashboard and add these environment variables:

```
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://portfolio-bice-beta-a4ejdfdsaj.vercel.app

# Supabase
SUPABASE_URL=https://zpmexjkaygqxthxznsil.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwbWV4amtheWdxeHRoeHpuc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDIwOTgsImV4cCI6MjA3Njk3ODA5OH0.YqxYeRJoFar_F9DvFx-m8k6lwakj0WTM-In4xg_V1fw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwbWV4amtheWdxeHRoeHpuc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQwMjA5OCwiZXhwIjoyMDc2OTc4MDk4fQ.hi-JvKZoCMSg-Oc6w-1CvhAVjaScdAkl66CSLyw0OBc

# JWT
JWT_SECRET=de16e8deae1ff0a64eaa13fcdf706e9e93239cf65a7be59ab3adff03bc548fb618bd906fceb9f1d610218e000c135eaac34e30a3de990c6c7f198dccab8ab2e5
JWT_EXPIRES_IN=7d

# Admin
ADMIN_EMAIL=admin@portfolio.com
ADMIN_PASSWORD=admin123

# Cloudinary
CLOUDINARY_CLOUD_NAME=di9orc4a9
CLOUDINARY_API_KEY=911765726855448
CLOUDINARY_API_SECRET=RrTxB1IUZzvMt2qOuaCkW9eK3N0

# Spotify
SPOTIFY_CLIENT_ID=206d18305151445da6bb835e7a37d311
SPOTIFY_CLIENT_SECRET=3ef579d6204d4480ba26694af107a328
SPOTIFY_REDIRECT_URI=https://portfolio-bice-beta-a4ejdfdsaj.vercel.app/callback
```

### 3. **Deploy Steps**

1. **Commit and push changes:**
   ```bash
   git add .
   git commit -m "Fix Vercel backend deployment"
   git push
   ```

2. **Set Environment Variables in Vercel:**
   - Go to your Vercel project dashboard
   - Navigate to Settings > Environment Variables
   - Add all the variables listed above

3. **Redeploy:**
   - Trigger a new deployment in Vercel dashboard
   - Or push another commit to trigger auto-deployment

### 4. **Test Backend**

After deployment, test these endpoints:
- `https://portfolio-fqur.vercel.app/api/health`
- `https://portfolio-fqur.vercel.app/api/spotify/auth-url`
- `https://portfolio-fqur.vercel.app/api/projects`

### 5. **Troubleshooting**

If still getting 404:
1. Check Vercel function logs
2. Verify environment variables are set
3. Ensure `api/index.js` is properly configured
4. Check that all dependencies are in `package.json`
