# 🔧 Environment Variables Setup Guide

## 📋 Complete Environment Variables for Vercel

Copy these variables to your Vercel dashboard: **Settings > Environment Variables**

---

## 🚀 **Backend Environment Variables**

### **Server Configuration**
```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://portfolio-two-nu-547du2vksm.vercel.app
```

### **Supabase Database**
```env
SUPABASE_URL=https://zpmexjkaygqxthxznsil.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwbWV4amtheWdxeHRoeHpuc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDIwOTgsImV4cCI6MjA3Njk3ODA5OH0.YqxYeRJoFar_F9DvFx-m8k6lwakj0WTM-In4xg_V1fw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwbWV4amtheWdxeHRoeHpuc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQwMjA5OCwiZXhwIjoyMDc2OTc4MDk4fQ.hi-JvKZoCMSg-Oc6w-1CvhAVjaScdAkl66CSLyw0OBc
```

### **JWT Authentication**
```env
JWT_SECRET=de16e8deae1ff0a64eaa13fcdf706e9e93239cf65a7be59ab3adff03bc548fb618bd906fceb9f1d610218e000c135eaac34e30a3de990c6c7f198dccab8ab2e5
JWT_EXPIRES_IN=7d
```

### **Admin Access**
```env
ADMIN_EMAIL=admin@portfolio.com
ADMIN_PASSWORD=admin123
```

### **Cloudinary Image Storage**
```env
CLOUDINARY_CLOUD_NAME=di9orc4a9
CLOUDINARY_API_KEY=911765726855448
CLOUDINARY_API_SECRET=RrTxB1IUZzvMt2qOuaCkW9eK3N0
```

### **Spotify Integration** 🎵
```env
SPOTIFY_CLIENT_ID=206d18305151445da6bb835e7a37d311
SPOTIFY_CLIENT_SECRET=3ef579d6204d4480ba26694af107a328
SPOTIFY_ACCESS_TOKEN=YOUR_ACCESS_TOKEN_FROM_AUTH_TOOL
SPOTIFY_REFRESH_TOKEN=YOUR_REFRESH_TOKEN_FROM_AUTH_TOOL
SPOTIFY_TOKEN_EXPIRES_AT=YOUR_EXPIRES_TIMESTAMP
```

---

## 🎨 **Frontend Environment Variables**

### **API Configuration**
```env
VITE_API_URL=https://portfolio-backend-six-azure.vercel.app
```

---

## 🎯 **How to Add to Vercel**

### **Step 1: Go to Vercel Dashboard**
1. Visit: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**

### **Step 2: Add Each Variable**
1. Click **"Add New"**
2. **Name**: `NODE_ENV`
3. **Value**: `production`
4. **Environment**: Select all (Production, Preview, Development)
5. Click **"Save"**

### **Step 3: Repeat for All Variables**
Add each variable from the list above.

---

## 🎵 **Spotify Token Setup**

### **Get Your Personal Tokens**
1. **Open**: `backend/spotify-auth.html` in your browser
2. **Enter**: Your Spotify Client ID and Secret
3. **Authorize**: Follow the OAuth flow
4. **Copy**: The generated tokens
5. **Replace**: `YOUR_ACCESS_TOKEN_FROM_AUTH_TOOL` with your actual token
6. **Replace**: `YOUR_REFRESH_TOKEN_FROM_AUTH_TOOL` with your actual refresh token
7. **Replace**: `YOUR_EXPIRES_TIMESTAMP` with the timestamp

---

## 🧪 **Testing Your Setup**

### **Backend Health Check**
- `https://portfolio-backend-six-azure.vercel.app/health`
- `https://portfolio-backend-six-azure.vercel.app/api/projects`

### **Spotify Integration**
- `https://portfolio-backend-six-azure.vercel.app/api/spotify/status`
- `https://portfolio-backend-six-azure.vercel.app/api/spotify/currently-playing`

### **Frontend**
- `https://portfolio-two-nu-547du2vksm.vercel.app`

---

## 🚨 **Troubleshooting**

### **Common Issues**

**1. Spotify Widget Not Working**
- ✅ Check `SPOTIFY_ACCESS_TOKEN` is set
- ✅ Verify `SPOTIFY_REFRESH_TOKEN` is set
- ✅ Test: `/api/spotify/status`

**2. Database Connection Issues**
- ✅ Check `SUPABASE_URL` is correct
- ✅ Verify `SUPABASE_ANON_KEY` is set
- ✅ Test: `/api/projects`

**3. Admin Panel Not Working**
- ✅ Check `JWT_SECRET` is set
- ✅ Verify `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- ✅ Test: `/admin` endpoint

**4. Image Upload Failing**
- ✅ Check Cloudinary credentials
- ✅ Verify `CLOUDINARY_CLOUD_NAME` is correct
- ✅ Test with smaller images

---

## 📱 **Your Deployment URLs**

- **Frontend**: https://portfolio-two-nu-547du2vksm.vercel.app
- **Backend API**: https://portfolio-backend-six-azure.vercel.app
- **Admin Panel**: https://portfolio-two-nu-547du2vksm.vercel.app/admin

---

## ✅ **Quick Setup Checklist**

- [ ] Add all backend environment variables to Vercel
- [ ] Add frontend environment variables to Vercel
- [ ] Get Spotify tokens using `spotify-auth.html`
- [ ] Test backend health endpoint
- [ ] Test Spotify integration
- [ ] Test admin panel access
- [ ] Test image upload functionality

Your portfolio will be fully functional once all environment variables are set! 🚀
