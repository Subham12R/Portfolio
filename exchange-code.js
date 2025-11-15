// Quick script to exchange WakaTime OAuth code
// Run: node exchange-code.js

const code = 'wWbNugCDAgamcTS8sSnM3UeScuPSFMKDQIkIY6QVNAdX9CpoeSioGLzUSw7Reg5ozmokTUOBwYhsQOEq';
const API_URL = process.env.API_URL || 'http://localhost:5000';

async function exchange() {
  try {
    console.log('🔄 Exchanging authorization code...\n');
    
    const response = await fetch(`${API_URL}/api/wakatime/oauth/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Success! Tokens received.\n');
      console.log('📝 Add these to your backend/.env file:\n');
      if (data.tokens) {
        console.log(`WAKATIME_ACCESS_TOKEN=${data.tokens.access_token}`);
        console.log(`WAKATIME_REFRESH_TOKEN=${data.tokens.refresh_token}`);
        console.log(`WAKATIME_TOKEN_EXPIRES_AT=${data.tokens.expires_at}\n`);
      }
      console.log('✨ Real-time data fetching is now active!');
    } else {
      console.error('❌ Error:', data.error || data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Tip: Make sure your backend server is running on port 5000');
  }
}

exchange();

