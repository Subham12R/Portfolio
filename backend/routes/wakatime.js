const express = require('express');
const router = express.Router();

const WAKATIME_API_KEY = process.env.WAKATIME_API_KEY;
const WAKATIME_API_URL = 'https://api.wakatime.com/api/v1';

if (!WAKATIME_API_KEY) {
  console.warn('WARNING: WAKATIME_API_KEY is not set in environment variables');
}

// Helper function to format duration
function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return { hours, minutes, totalSeconds };
}

// Get today's coding time
router.get('/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // First, try to get durations for today
    let response = await fetch(`${WAKATIME_API_URL}/users/current/durations?date=${today}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${WAKATIME_API_KEY}:`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    let todayTotalSeconds = 0;
    let lastCodingDate = null;
    let editorInfo = null;

    if (response.ok) {
      const durationsData = await response.json();
      
      // Calculate total from durations
      if (durationsData.data && durationsData.data.length > 0) {
        todayTotalSeconds = durationsData.data.reduce((total, duration) => total + (duration.duration || 0), 0);
        // Get editor info from first duration
        editorInfo = durationsData.data[0].project || 'Unknown';
      }
    }

    // If no coding today, try to get summaries for last 7 days
    if (todayTotalSeconds === 0) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      response = await fetch(`${WAKATIME_API_URL}/users/current/summaries?start=${startDateStr}&end=${endDateStr}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${WAKATIME_API_KEY}:`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const summariesData = await response.json();
        
        if (summariesData.data && summariesData.data.length > 0) {
          // Find the most recent day with coding
          for (const day of summariesData.data) {
            const daySeconds = day?.grand_total?.total_seconds || 0;
            if (daySeconds > 0) {
              todayTotalSeconds = daySeconds;
              lastCodingDate = day.range?.date || day.range?.text || null;
              // Get editor info from the day's data
              if (day.editors && day.editors.length > 0) {
                editorInfo = day.editors[0].name;
              }
              break;
            }
          }
        }
      }
    }
    
    const { hours, minutes } = formatDuration(todayTotalSeconds);
    const isToday = lastCodingDate === null;
    
    res.json({
      success: true,
      time: {
        hours,
        minutes,
        totalSeconds: todayTotalSeconds,
        formatted: hours > 0 ? `${hours}hr ${minutes}min` : `${minutes}min`,
        isToday,
        lastCodingDate,
        editor: editorInfo
      }
    });

  } catch (error) {
    console.error('WakaTime API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch WakaTime data',
      details: error.message
    });
  }
});

// Get current status (what you're coding now)
router.get('/status', async (req, res) => {
  try {
    // WakaTime uses Basic auth but differently - the API key is the username, password is empty
    const response = await fetch(`${WAKATIME_API_URL}/users/current/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${WAKATIME_API_KEY}:`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`WakaTime API error: ${response.status}`);
    }

    const data = await response.json();
    
    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('WakaTime API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch WakaTime status',
      details: error.message
    });
  }
});

// Get status bar data (current coding activity)
router.get('/status-bar', async (req, res) => {
  try {
    // First try today's data
    let response = await fetch(`${WAKATIME_API_URL}/users/current/status_bar/today`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${WAKATIME_API_KEY}:`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    let data = null;
    let isToday = true;

    if (response.ok) {
      data = await response.json();
      // Check if there's actual coding data
      if (data.data && data.data.text && data.data.text !== '0 secs') {
        res.json({
          success: true,
          data: data,
          isToday: true
        });
        return;
      }
    }

    // If no data for today, try yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    response = await fetch(`${WAKATIME_API_URL}/users/current/status_bar/${yesterdayStr}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${WAKATIME_API_KEY}:`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      data = await response.json();
      isToday = false;
    }

    if (data && data.data && data.data.text && data.data.text !== '0 secs') {
      res.json({
        success: true,
        data: data,
        isToday: isToday
      });
    } else {
      // No data for today or yesterday
      res.json({
        success: true,
        data: null,
        isToday: false,
        message: 'No recent coding activity found'
      });
    }

  } catch (error) {
    console.error('WakaTime status bar API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch WakaTime status bar data',
      details: error.message
    });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!WAKATIME_API_KEY,
    apiKeyPrefix: WAKATIME_API_KEY ? WAKATIME_API_KEY.substring(0, 10) + '...' : 'none'
  });
});

module.exports = router;
