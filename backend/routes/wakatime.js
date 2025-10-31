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
    // Check if API key is configured
    if (!WAKATIME_API_KEY) {
      return res.json({
        success: false,
        error: 'WakaTime API key not configured',
        details: 'WAKATIME_API_KEY environment variable is not set'
      });
    }

    // WakaTime uses Basic auth but differently - the API key is the username, password is empty
    const response = await fetch(`${WAKATIME_API_URL}/users/current/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${WAKATIME_API_KEY}:`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    // Handle different error status codes - return 200 with error info instead of 500
    if (!response.ok) {
      let errorText = 'Unknown error';
      try {
        errorText = await response.text();
      } catch (e) {
        // If we can't read the error, just use status
      }
      
      console.error(`WakaTime API error (${response.status}):`, errorText);
      
      // Return 200 with error info instead of 500 to prevent breaking frontend
      return res.json({
        success: false,
        error: `WakaTime API error: ${response.status}`,
        details: errorText,
        statusCode: response.status
      });
    }

    const data = await response.json();
    
    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('WakaTime status API error:', error);
    // Return 200 with error info instead of 500 to prevent breaking frontend
    res.json({
      success: false,
      error: 'Failed to fetch WakaTime status',
      details: error.message
    });
  }
});

// Get status bar data (current coding activity)
router.get('/status-bar', async (req, res) => {
  try {
    // First check current status to see if actively coding right now
    let currentStatusResponse = await fetch(`${WAKATIME_API_URL}/users/current/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${WAKATIME_API_KEY}:`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    let isCurrentlyCoding = false;
    let currentStatusData = null;

    if (currentStatusResponse.ok) {
      currentStatusData = await currentStatusResponse.json();
      // Check if currently coding (entity exists and is recent)
      if (currentStatusData.data && currentStatusData.data.entity) {
        // Check if last heartbeat is within last 2 minutes (actively coding)
        const lastHeartbeat = currentStatusData.data.last_heartbeat_at;
        if (lastHeartbeat) {
          const heartbeatTime = new Date(lastHeartbeat);
          const now = new Date();
          const diffMinutes = (now - heartbeatTime) / (1000 * 60);
          isCurrentlyCoding = diffMinutes < 2;
        }
      }
    }

    // Get status bar for today
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
          isToday: true,
          isCurrentlyCoding: isCurrentlyCoding,
          currentStatus: currentStatusData?.data || null
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
        isToday: isToday,
        isCurrentlyCoding: isCurrentlyCoding,
        currentStatus: currentStatusData?.data || null
      });
    } else {
      // No data for today or yesterday
      res.json({
        success: true,
        data: null,
        isToday: false,
        isCurrentlyCoding: isCurrentlyCoding,
        currentStatus: currentStatusData?.data || null,
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

// Get all time since today (total coding time and last activity)
router.get('/all-time-since-today', async (req, res) => {
  try {
    const response = await fetch(`${WAKATIME_API_URL}/users/current/all_time_since_today`, {
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
    console.error('WakaTime all time API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch WakaTime all time data',
      details: error.message
    });
  }
});

// Get durations for current user (with optional date parameter)
router.get('/durations', async (req, res) => {
  try {
    const { date } = req.query;
    const dateParam = date ? `?date=${date}` : '';
    
    const response = await fetch(`${WAKATIME_API_URL}/users/current/durations${dateParam}`, {
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
    console.error('WakaTime durations API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch WakaTime durations',
      details: error.message
    });
  }
});

// Get heartbeats for current user (for real-time tracking)
router.get('/heartbeats', async (req, res) => {
  try {
    const { date } = req.query;
    const dateParam = date ? `?date=${date}` : '';
    
    const response = await fetch(`${WAKATIME_API_URL}/users/current/heartbeats${dateParam}`, {
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
    console.error('WakaTime heartbeats API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch WakaTime heartbeats',
      details: error.message
    });
  }
});

// Get stats for current user (with optional range parameter)
router.get('/stats/:range?', async (req, res) => {
  try {
    const { range } = req.params;
    const rangeParam = range ? `/${range}` : '';
    
    const response = await fetch(`${WAKATIME_API_URL}/users/current/stats${rangeParam}`, {
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
    console.error('WakaTime stats API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch WakaTime stats',
      details: error.message
    });
  }
});

// Get editors information
router.get('/editors', async (req, res) => {
  try {
    const response = await fetch(`${WAKATIME_API_URL}/editors`, {
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
    console.error('WakaTime editors API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch WakaTime editors',
      details: error.message
    });
  }
});

// Get status bar for today (enhanced version)
router.get('/status-bar-today', async (req, res) => {
  try {
    const response = await fetch(`${WAKATIME_API_URL}/users/current/status_bar/today`, {
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
    console.error('WakaTime status bar today API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch WakaTime status bar today',
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
