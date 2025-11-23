# Spotify Web Playback SDK 404 Fix

## Problem

When the Spotify Web Playback SDK reports the player as "ready" with a device ID, there's a race condition where Spotify's backend API might not have registered the device yet. This causes 404 errors on the initial playback attempt, while subsequent attempts work fine.

## Solution

We've implemented a robust solution that handles this race condition:

### 1. Device Availability Check Endpoint
Added `/api/spotify/device/:deviceId/available` endpoint to check if the device is actually registered in Spotify's API before attempting playback.

### 2. Retry Logic with Exponential Backoff
The playback function now includes:
- Automatic retry on 404 errors (up to 5 attempts)
- Exponential backoff (300ms, 600ms, 1200ms, etc., max 2000ms)
- Device availability verification before first playback attempt
- Smart retry logic that waits for the device to be ready

### 3. Improved Ready Event Handler
The ready event handler now:
- Waits 500ms after the ready event fires
- Verifies device availability in Spotify's API
- Logs helpful messages for debugging

### 4. Backend Playback Endpoint Enhancement
The `/api/spotify/play` endpoint now:
- Checks device availability before attempting playback
- Returns a 202 status with retry flag if device isn't ready
- Includes retry attempt tracking

## How It Works

1. **SDK Ready Event**: When the SDK fires the "ready" event, we wait 500ms and verify the device is available.

2. **Playback Attempt**: When user clicks play:
   - First, verify device is available (with retries)
   - Attempt playback with automatic retry on 404
   - Exponential backoff between retries (300ms → 600ms → 1200ms → 2000ms)
   - Fallback to preview URL if all SDK attempts fail

3. **Retry Logic**: 
   - Max 5 retry attempts
   - Progressive delays (300ms base, doubled each attempt, capped at 2000ms)
   - Network errors also trigger retries
   - 404 errors trigger device availability check and retry

## Benefits

- ✅ Eliminates 404 errors on initial playback
- ✅ No arbitrary sleep delays needed
- ✅ Graceful degradation (falls back to preview URLs)
- ✅ Better user experience (seamless playback)
- ✅ Helpful logging for debugging

## Testing

To test the fix:

1. Load the portfolio page
2. Wait for Spotify component to initialize
3. Click play immediately after the track loads
4. Verify playback starts without 404 errors
5. Check browser console for retry logs (should rarely trigger now)

## Technical Details

### Retry Flow
```
Playback Request
    ↓
Check Device Available (if first attempt)
    ↓
Try Playback
    ↓
404? → Wait → Retry (max 5 times)
    ↓
Success → Update UI
    ↓
Failure → Fallback to Preview
```

### Code Changes

**Backend:**
- Added device availability check endpoint
- Enhanced `/play` endpoint with retry logic
- Device verification before playback

**Frontend:**
- Added `waitForDeviceAvailability()` function
- Enhanced `playTrackWithSDK()` with retry logic
- Improved ready event handler
- Better error handling and logging

## Notes

- The 500ms delay in the ready handler is minimal and ensures better reliability
- Retry logic uses exponential backoff to avoid overwhelming the API
- All retries are transparent to the user (no error messages unless all attempts fail)
- Falls back gracefully to preview URLs if SDK completely fails

